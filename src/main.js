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
import { renderSettingsModal } from './components/SettingsModal.js';

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
  activeQuizFilter: savedState.activeQuizFilter || 'all',
  pendingScrollTop: null
};

const initialReadingPosition = Storage.getReadingPosition(state.activeCourseId);
if (state.activeView === 'chapter' && initialReadingPosition?.chapterId === state.activeChapterId) {
  state.pendingScrollTop = initialReadingPosition.scrollTop || 0;
}

// Older versions stored only chapter IDs. Attribute those records to the last
// active course before rendering so future progress is isolated per course.
Storage.migrateLegacyReadChapters(state.activeCourseId);
Storage.migrateLegacyQuizData(state.activeCourseId);

// Initialize Theme
Storage.setTheme(Storage.getTheme());

document.addEventListener('DOMContentLoaded', () => {
  const headerContainer = document.querySelector('#app-header');
  const sidebarContainer = document.querySelector('#app-sidebar');
  const sidebarWrapper = document.querySelector('#app-sidebar-wrapper');
  const mainContainer = document.querySelector('#app-main');
  const bottomNavContainer = document.querySelector('#app-bottom-nav');
  const modalContainer = document.querySelector('#app-modal');
  const scrollMainToTop = () => mainContainer.scrollTo({ top: 0, behavior: 'auto' });
  const saveCurrentReadingPosition = () => {
    if (state.activeView === 'chapter') {
      Storage.setReadingPosition(state.activeCourseId, state.activeChapterId, mainContainer.scrollTop);
    }
  };
  let scrollSaveFrame = null;
  mainContainer.addEventListener('scroll', () => {
    if (state.activeView !== 'chapter') return;
    cancelAnimationFrame(scrollSaveFrame);
    scrollSaveFrame = requestAnimationFrame(saveCurrentReadingPosition);
  }, { passive: true });

  const updateUI = () => {
    // Get current active course data
    const currentCourse = ALL_COURSES[state.activeCourseId] || ALL_COURSES[DEFAULT_COURSE_ID];
    const chapters = currentCourse.chapters || [];
    const quizQuestions = currentCourse.quizQuestions || [];
    const courseConfig = currentCourse.config || {};
    if (state.activeView === 'quiz' && quizQuestions.length === 0) state.activeView = 'chapter';
    const isGlobalView = state.activeView === 'course_select' || state.activeView === 'activity';

    if (isGlobalView) {
      sidebarWrapper.classList.remove('lg:block');
      sidebarWrapper.classList.add('hidden');
    } else {
      sidebarWrapper.classList.add('hidden', 'lg:block');
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
          saveCurrentReadingPosition();
          state.activeCourseId = newCourseId;
          const newCourseChapters = ALL_COURSES[newCourseId].chapters || [];
          const resume = Storage.getReadingPosition(newCourseId);
          state.activeChapterId = newCourseChapters.some(chapter => chapter.id === resume?.chapterId)
            ? resume.chapterId
            : newCourseChapters[0]?.id || 'intro';
          state.pendingScrollTop = resume?.scrollTop || 0;
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
      onOpenSettings: () => {
        renderSettingsModal(modalContainer, {
          activeCourseId: state.activeCourseId,
          courseTitle: courseConfig.title || '現在の教材',
          onDataChange: type => {
            if (type === 'progress') {
              state.activeChapterId = chapters[0]?.id || 'intro';
              state.pendingScrollTop = 0;
            }
            updateUI();
          }
        });
      },
      onSelectView: (view, id) => {
        saveCurrentReadingPosition();
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
        saveCurrentReadingPosition();
        state.activeView = view;
        if (view === 'chapter') state.activeChapterId = id;
        if (view === 'quiz') state.activeQuizFilter = id;
        
        scrollMainToTop();
        updateUI();
      }
    });

    // Render Mobile Bottom Navigation Bar
    if (bottomNavContainer) {
      renderBottomNav(bottomNavContainer, {
        activeView: state.activeView,
        hasQuiz: quizQuestions.length > 0,
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
            saveCurrentReadingPosition();
            state.activeView = navKey;
            scrollMainToTop();
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
        onSelectCourse: (selectedCourseId, chapterId, scrollTop = 0) => {
          saveCurrentReadingPosition();
          state.activeCourseId = selectedCourseId;
          state.activeView = 'chapter';
          const selChapters = ALL_COURSES[selectedCourseId]?.chapters || [];
          state.activeChapterId = selChapters.some(chapter => chapter.id === chapterId) ? chapterId : selChapters[0]?.id || 'intro';
          state.pendingScrollTop = scrollTop;
          updateUI();
        }
      });
    } else if (state.activeView === 'activity') {
      renderActivityViewer(mainContainer, { allCourses: ALL_COURSES });
    } else if (state.activeView === 'chapter') {
      renderChapterViewer(mainContainer, state.activeChapterId, {
        chapters: chapters,
        quizQuestions: quizQuestions,
        courseConfig: courseConfig,
        onNavigateChapter: (nextId) => {
          saveCurrentReadingPosition();
          state.activeChapterId = nextId;
          scrollMainToTop();
          updateUI();
        },
        onSelectView: (view, filter) => {
          saveCurrentReadingPosition();
          state.activeView = view;
          if (view === 'quiz') state.activeQuizFilter = filter;
          scrollMainToTop();
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
          saveCurrentReadingPosition();
          state.activeView = view;
          if (view === 'chapter') state.activeChapterId = id;
          if (view === 'quiz') state.activeQuizFilter = id;
          scrollMainToTop();
          updateUI();
        }
      });
    } else if (state.activeView === 'quiz') {
      const quizWrapper = document.createElement('div');
      quizWrapper.className = 'animate-fade-in';
      mainContainer.appendChild(quizWrapper);
      renderQuizViewer(quizWrapper, state.activeQuizFilter, quizQuestions, courseConfig);
    }

    if (state.activeView === 'chapter') {
      const targetScrollTop = state.pendingScrollTop;
      state.pendingScrollTop = null;
      if (targetScrollTop !== null) requestAnimationFrame(() => mainContainer.scrollTo({ top: targetScrollTop, behavior: 'auto' }));
      else Storage.setReadingPosition(state.activeCourseId, state.activeChapterId, mainContainer.scrollTop);
    }
  };

  updateUI();
});
