// Main application entry point & router with Mobile-First support

import './style.css';
import { Storage } from './utils/storage.js';
import { ALL_COURSES, DEFAULT_COURSE_ID } from './data/coursesData.js';
import { renderHeader } from './components/Header.js';
import { renderSidebar } from './components/Sidebar.js';
import { renderBottomNav } from './components/BottomNav.js';
import { renderCourseSelectViewer } from './components/CourseSelectViewer.js';
import { renderActivityViewer } from './components/ActivityViewer.js';
import { renderChapterViewer } from './components/ChapterViewer.js';
import { renderQuizViewer } from './components/QuizViewer.js';
import { renderSearchModal } from './components/SearchModal.js';

// Restore saved state from LocalStorage
const savedState = Storage.getAppState() || {};
const initialCourseId = Storage.getActiveCourseId() || DEFAULT_COURSE_ID;
const initialView = ['course_select', 'activity', 'chapter', 'quiz', 'toc'].includes(savedState.activeView)
  ? savedState.activeView
  : 'course_select';

const state = {
  activeCourseId: ALL_COURSES[initialCourseId] ? initialCourseId : DEFAULT_COURSE_ID,
  activeView: initialView,
  activeChapterId: savedState.activeChapterId || 'intro',
  activeQuizFilter: savedState.activeQuizFilter || 'all'
};

// Older versions stored only chapter IDs. Attribute those records to the last
// active course before rendering so future progress is isolated per course.
Storage.migrateLegacyReadChapters(state.activeCourseId);

// Initialize Theme
Storage.setTheme(Storage.getTheme());

document.addEventListener('DOMContentLoaded', () => {
  const headerContainer = document.querySelector('#app-header');
  const sidebarContainer = document.querySelector('#app-sidebar');
  const sidebarWrapper = document.querySelector('#app-sidebar-wrapper');
  const mainContainer = document.querySelector('#app-main');
  const bottomNavContainer = document.querySelector('#app-bottom-nav');
  const modalContainer = document.querySelector('#app-modal');

  const updateUI = () => {
    // Get current active course data
    const currentCourse = ALL_COURSES[state.activeCourseId] || ALL_COURSES[DEFAULT_COURSE_ID];
    const chapters = currentCourse.chapters || [];
    const quizQuestions = currentCourse.quizQuestions || [];
    const courseConfig = currentCourse.config || {};
    const isGlobalView = state.activeView === 'course_select' || state.activeView === 'activity';

    if (isGlobalView) {
      sidebarWrapper.classList.remove('md:block');
      sidebarWrapper.classList.add('hidden');
    } else {
      sidebarWrapper.classList.add('hidden', 'md:block');
    }

    // Validate activeChapterId exists in current course, fallback to first chapter
    if (!chapters.some(c => c.id === state.activeChapterId) && chapters.length > 0) {
      state.activeChapterId = chapters[0].id;
    }

    // Save active state to LocalStorage so reload returns to exact same view
    Storage.setActiveCourseId(state.activeCourseId);
    Storage.setAppState({
      activeCourseId: state.activeCourseId,
      activeView: state.activeView,
      activeChapterId: state.activeChapterId,
      activeQuizFilter: state.activeQuizFilter
    });

    // Render Header
    renderHeader(headerContainer, {
      activeView: state.activeView,
      activeCourseId: state.activeCourseId,
      allCourses: ALL_COURSES,
      totalChaptersCount: chapters.length,
      onSelectCourse: (newCourseId) => {
        if (ALL_COURSES[newCourseId]) {
          state.activeCourseId = newCourseId;
          const newCourseChapters = ALL_COURSES[newCourseId].chapters || [];
          state.activeChapterId = newCourseChapters[0]?.id || 'intro';
          updateUI();
        }
      },
      onOpenSearch: () => {
        renderSearchModal(modalContainer, {
          chapters: chapters,
          quizQuestions: quizQuestions,
          onClose: () => {},
          onSelectResult: (type, id) => {
            if (type === 'ch') {
              state.activeView = 'chapter';
              state.activeChapterId = id;
            } else if (type === 'quiz') {
              state.activeView = 'quiz';
              state.activeQuizFilter = 'all';
            }
            updateUI();
          }
        });
      },
      onSelectView: (view, id) => {
        state.activeView = view;
        if (view === 'chapter') state.activeChapterId = id || chapters[0]?.id || 'intro';
        if (view === 'quiz') state.activeQuizFilter = id || 'all';
        updateUI();
      }
    });

    // Render Sidebar
    renderSidebar(sidebarContainer, {
      chapters: chapters,
      quizQuestions: quizQuestions,
      courseConfig: courseConfig,
      activeView: state.activeView,
      activeChapterId: state.activeChapterId,
      activeQuizFilter: state.activeQuizFilter,
      onSelectView: (view, id) => {
        state.activeView = view;
        if (view === 'chapter') state.activeChapterId = id;
        if (view === 'quiz') state.activeQuizFilter = id;
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
        updateUI();
      }
    });

    // Render Mobile Bottom Navigation Bar
    if (bottomNavContainer) {
      renderBottomNav(bottomNavContainer, {
        activeView: state.activeView,
        onSelectNav: (navKey) => {
          if (navKey === 'search') {
            renderSearchModal(modalContainer, {
              chapters: chapters,
              quizQuestions: quizQuestions,
              onClose: () => {},
              onSelectResult: (type, id) => {
                if (type === 'ch') {
                  state.activeView = 'chapter';
                  state.activeChapterId = id;
                } else if (type === 'quiz') {
                  state.activeView = 'quiz';
                  state.activeQuizFilter = 'all';
                }
                updateUI();
              }
            });
          } else {
            state.activeView = navKey;
            window.scrollTo({ top: 0, behavior: 'smooth' });
            updateUI();
          }
        }
      });
    }

    // Render Main Viewport
    mainContainer.innerHTML = '';

    if (state.activeView === 'course_select') {
      renderCourseSelectViewer(mainContainer, {
        allCourses: ALL_COURSES,
        activeCourseId: state.activeCourseId,
        onSelectCourse: (selectedCourseId) => {
          state.activeCourseId = selectedCourseId;
          state.activeView = 'chapter';
          const selChapters = ALL_COURSES[selectedCourseId]?.chapters || [];
          state.activeChapterId = selChapters[0]?.id || 'intro';
          window.scrollTo({ top: 0, behavior: 'smooth' });
          updateUI();
        }
      });
    } else if (state.activeView === 'activity') {
      renderActivityViewer(mainContainer);
    } else if (state.activeView === 'chapter') {
      renderChapterViewer(mainContainer, state.activeChapterId, {
        chapters: chapters,
        courseConfig: courseConfig,
        onNavigateChapter: (nextId) => {
          state.activeChapterId = nextId;
          window.scrollTo({ top: 0, behavior: 'smooth' });
          updateUI();
        },
        onSelectView: (view, filter) => {
          state.activeView = view;
          if (view === 'quiz') state.activeQuizFilter = filter;
          window.scrollTo({ top: 0, behavior: 'smooth' });
          updateUI();
        }
      });
    } else if (state.activeView === 'toc') {
      renderSidebar(mainContainer, {
        chapters: chapters,
        quizQuestions: quizQuestions,
        courseConfig: courseConfig,
        activeView: state.activeView,
        activeChapterId: state.activeChapterId,
        activeQuizFilter: state.activeQuizFilter,
        mode: 'page',
        onSelectView: (view, id) => {
          state.activeView = view;
          if (view === 'chapter') state.activeChapterId = id;
          if (view === 'quiz') state.activeQuizFilter = id;
          window.scrollTo({ top: 0, behavior: 'smooth' });
          updateUI();
        }
      });
    } else if (state.activeView === 'quiz') {
      const quizWrapper = document.createElement('div');
      quizWrapper.className = 'animate-fade-in';
      mainContainer.appendChild(quizWrapper);
      renderQuizViewer(quizWrapper, state.activeQuizFilter, quizQuestions, courseConfig);
    }
  };

  updateUI();
});
