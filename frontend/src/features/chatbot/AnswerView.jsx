import { AnimatePresence, motion } from 'framer-motion';
import PropTypes from 'prop-types';
import BackButton from './BackButton';
import TypingDots from './TypingDots';

/**
 * Renders answer conversation view.
 * @param {Object} props - The component props.
 * @param {Object} props.img - Object containing image assets.
 * @param {Object} props.activeQuestion - The currently selected question and answer object.
 * @param {string} props.activeQuestion.q - The question text.
 * @param {string|JSX.Element} props.activeQuestion.a - The answer content.
 * @param {boolean} props.isTyping - Whether the chatbot is currently simulating typing.
 * @param {boolean} props.showAnswer - Whether to display the answer content.
 * @param {Function} props.handleBack - Callback to return to the previous view.
 * @returns {JSX.Element}
 */
export default function AnswerView({ img, activeQuestion, isTyping, showAnswer, handleBack }) {
  let responseContent = null;

  if (isTyping) {
    responseContent = (
      <motion.div
        key="typing"
        initial={{ opacity: 0, scale: 0.92, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: -4 }}
        transition={{ duration: 0.18 }}
        className="rounded-pf-control border border-pf-editorial-line bg-pf-editorial-base px-4 py-3"
      >
        <TypingDots />
      </motion.div>
    );
  } else if (showAnswer) {
    responseContent = (
      <motion.div
        key="answer"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-[88%] rounded-pf-control border border-pf-editorial-line bg-pf-editorial-base px-4 py-3 text-sm leading-relaxed text-pf-editorial-ink"
      >
        {activeQuestion.a}
      </motion.div>
    );
  }

  return (
    <div className="space-y-3 pt-1">
      <BackButton onClick={handleBack} />

      <div className="flex justify-end">
        <div className="max-w-[84%] rounded-pf-control border border-pf-editorial-accent bg-pf-editorial-accent-soft px-4 py-2.5 text-sm font-medium leading-relaxed text-pf-editorial-ink">
          {activeQuestion.q}
        </div>
      </div>

      <div className="flex items-start gap-2.5">
        <img src={img.chatbotIcon} alt="Assistant" className="mt-0.5 h-7 w-7 rounded-pf-control border border-pf-editorial-line object-cover opacity-75 saturate-50" />
        <AnimatePresence mode="wait">{responseContent}</AnimatePresence>
      </div>
    </div>
  );
}

AnswerView.propTypes = {
  img: PropTypes.shape({
    chatbotIcon: PropTypes.string.isRequired,
  }).isRequired,
  activeQuestion: PropTypes.shape({
    q: PropTypes.string.isRequired,
    a: PropTypes.node.isRequired,
  }).isRequired,
  isTyping: PropTypes.bool.isRequired,
  showAnswer: PropTypes.bool.isRequired,
  handleBack: PropTypes.func.isRequired,
};
