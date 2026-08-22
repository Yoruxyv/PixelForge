import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import chatbotIcon from '@/assets/PixelForgeChatbot.png';
import { FAQ_DATA, QUICK_ACTIONS, CAT_ACCENT } from './chatBotdata';
import { WIDGET_STYLES } from './chatBotStyles';
import { useFaqChatBot } from './useFaqChatBot';
import ChatbotHeader from './ChatbotHeader';
import HomeView from './HomeView';
import CategoryView from './CategoryView';
import SearchView from './SearchView';
import AnswerView from './AnswerView';
import FeedbackView from './FeedbackView';
import FabToggle from './FabToggle';

const img = { chatbotIcon };

/**
 * Renders FAQ chatbot container and routes chatbot views.
 */
export default function FaqChatbotWidget() {
  const {
    isOpen,
    setIsOpen,
    view,
    setView,
    activeCategory,
    activeQuestion,
    query,
    setQuery,
    isTyping,
    showAnswer,
    searchFocused,
    setSearchFocused,
    filteredResults,
    startAnswerFlow,
    openCategory,
    openFromQuickAction,
    handleBack,
    handleClose,
  } = useFaqChatBot();

  const bodyRef = useRef(null);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = 0;
  }, [view, isTyping, showAnswer]);

  /**
   * Intercepts quick actions to route to specific views before falling back to FAQ search.
   * @param {Object} action - The clicked quick action object.
   */
  const handleQuickActionClick = (action) => {
    if (action.type === 'view') {
      setView(action.target);
    } else {
      openFromQuickAction(action.text);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: WIDGET_STYLES }} />
      <div
        className="fw fixed right-4 z-[var(--pf-z-toast)] flex flex-col items-end text-pf-editorial-ink sm:right-5"
        style={{
          bottom:
            'calc(var(--footer-safe-offset, 16px) + env(safe-area-inset-bottom))',
        }}
      >
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 28, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.96 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="mb-3 flex h-[78vh] min-h-130 w-95 max-w-[calc(100vw-24px)] max-h-170 flex-col overflow-hidden rounded-pf-card border border-pf-editorial-line bg-pf-editorial-surface shadow-pf-float"
            >
              <ChatbotHeader
                img={img}
                query={query}
                setQuery={setQuery}
                setView={setView}
                searchFocused={searchFocused}
                setSearchFocused={setSearchFocused}
                handleClose={handleClose}
              />

              <div
                ref={bodyRef}
                className="flex-1 overflow-y-auto bg-pf-editorial-surface px-4 py-4 fw-scroll"
              >
                {view === 'home' && (
                  <HomeView
                    FAQ_DATA={FAQ_DATA}
                    QUICK_ACTIONS={QUICK_ACTIONS}
                    CAT_ACCENT={CAT_ACCENT}
                    openFromQuickAction={handleQuickActionClick}
                    openCategory={openCategory}
                  />
                )}
                {view === 'category' && activeCategory && (
                  <CategoryView
                    activeCategory={activeCategory}
                    CAT_ACCENT={CAT_ACCENT}
                    handleBack={handleBack}
                    startAnswerFlow={startAnswerFlow}
                  />
                )}
                {view === 'search' && (
                  <SearchView
                    query={query}
                    setQuery={setQuery}
                    filteredResults={filteredResults}
                    handleBack={handleBack}
                    startAnswerFlow={startAnswerFlow}
                  />
                )}
                {view === 'answer' && activeQuestion && (
                  <AnswerView
                    img={img}
                    activeQuestion={activeQuestion}
                    isTyping={isTyping}
                    showAnswer={showAnswer}
                    handleBack={handleBack}
                  />
                )}
                {view === 'feedback' && (
                  <FeedbackView handleBack={handleBack} />
                )}
              </div>

              <div className="flex h-10 shrink-0 items-center border-t border-pf-editorial-line px-4">
                <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-pf-editorial-muted">
                  Support / PixelForge
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <FabToggle isOpen={isOpen} setIsOpen={setIsOpen} />
      </div>
    </>
  );
}
