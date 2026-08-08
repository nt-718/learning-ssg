// Main application entry point & router with Mobile-First support

import './style.css';
import { Storage } from './utils/storage.js';
import { renderHeader } from './components/Header.js';
import { renderSidebar } from './components/Sidebar.js';
import { renderBottomNav } from './components/BottomNav.js';
import { renderChapterViewer } from './components/ChapterViewer.js';
import { renderQuizViewer } from './components/QuizViewer.js';
import { renderSearchModal } from './components/SearchModal.js';
import { renderSixCoefficients } from './visualizers/SixCoefficients.js';
import { renderPensionSimulator } from './visualizers/PensionSimulator.js';
import { renderTaxCalculator } from './visualizers/TaxCalculator.js';
import { renderRealEstateSim } from './visualizers/RealEstateSim.js';
import { renderNisaVisualizer } from './visualizers/NisaVisualizer.js';
import { renderInheritanceSim } from './visualizers/InheritanceSim.js';

// Application state
const state = {
  activeView: 'chapter', // 'chapter' | 'tool' | 'quiz'
  activeChapterId: 'intro',
  activeToolId: 'six_coefficients',
  activeQuizFilter: 'all',
  isDrawerOpen: false
};

// Initialize Theme
Storage.setTheme(Storage.getTheme());

document.addEventListener('DOMContentLoaded', () => {
  const headerContainer = document.querySelector('#app-header');
  const sidebarContainer = document.querySelector('#app-sidebar');
  const sidebarWrapper = document.querySelector('#app-sidebar-wrapper');
  const mainContainer = document.querySelector('#app-main');
  const bottomNavContainer = document.querySelector('#app-bottom-nav');
  const modalContainer = document.querySelector('#app-modal');

  const toggleDrawer = (open) => {
    state.isDrawerOpen = typeof open === 'boolean' ? open : !state.isDrawerOpen;
    if (state.isDrawerOpen) {
      sidebarWrapper.classList.remove('hidden');
    } else {
      sidebarWrapper.classList.add('hidden');
    }
  };

  // Backdrop click closes drawer
  const backdrop = document.querySelector('#app-sidebar-backdrop');
  if (backdrop) {
    backdrop.addEventListener('click', () => toggleDrawer(false));
  }

  const updateUI = () => {
    // Render Header
    renderHeader(headerContainer, {
      onOpenSearch: () => {
        renderSearchModal(modalContainer, {
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
      onToggleSidebar: () => toggleDrawer(),
      onSelectView: (view, id) => {
        state.activeView = view;
        if (view === 'chapter') state.activeChapterId = id || 'intro';
        if (view === 'quiz') state.activeQuizFilter = id || 'all';
        toggleDrawer(false);
        updateUI();
      }
    });

    // Render Sidebar
    renderSidebar(sidebarContainer, {
      activeView: state.activeView,
      activeChapterId: state.activeChapterId,
      activeToolId: state.activeToolId,
      onSelectView: (view, id) => {
        state.activeView = view;
        if (view === 'chapter') state.activeChapterId = id;
        if (view === 'tool') state.activeToolId = id;
        if (view === 'quiz') state.activeQuizFilter = id;
        
        toggleDrawer(false);
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
          } else if (navKey === 'drawer') {
            toggleDrawer(true);
          } else {
            state.activeView = navKey;
            toggleDrawer(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            updateUI();
          }
        }
      });
    }

    // Render Main Viewport
    mainContainer.innerHTML = '';

    if (state.activeView === 'chapter') {
      renderChapterViewer(mainContainer, state.activeChapterId, {
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
    } else if (state.activeView === 'tool') {
      const toolWrapper = document.createElement('div');
      toolWrapper.className = 'max-w-4xl mx-auto px-3 py-6 animate-fade-in';
      mainContainer.appendChild(toolWrapper);

      if (state.activeToolId === 'six_coefficients') renderSixCoefficients(toolWrapper);
      else if (state.activeToolId === 'pension_sim') renderPensionSimulator(toolWrapper);
      else if (state.activeToolId === 'tax_calc') renderTaxCalculator(toolWrapper);
      else if (state.activeToolId === 'real_estate_sim') renderRealEstateSim(toolWrapper);
      else if (state.activeToolId === 'nisa_map') renderNisaVisualizer(toolWrapper);
      else if (state.activeToolId === 'inheritance_tree') renderInheritanceSim(toolWrapper);
    } else if (state.activeView === 'quiz') {
      const quizWrapper = document.createElement('div');
      quizWrapper.className = 'animate-fade-in';
      mainContainer.appendChild(quizWrapper);
      renderQuizViewer(quizWrapper, state.activeQuizFilter);
    }
  };

  updateUI();
});
