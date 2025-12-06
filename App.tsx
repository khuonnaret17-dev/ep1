import React, { useState } from 'react';
import { quizParts } from './data';
import { AppScreen, QuizPart } from './types';
import { motion, AnimatePresence, Variants } from 'framer-motion';

// --- Icons ---
const TelegramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.198 2.433a2.242 2.242 0 0 0-1.022.215l-8.609 3.33c-2.068.8-4.133 1.598-5.724 2.21a405.15 405.15 0 0 1-2.863 1.137c-.883.356-1.03 1.051-.43 1.523l3.52 2.768a.305.305 0 0 0 .15.056c.074 0 .149-.03.203-.086.58-.6 3.96-3.835 3.96-3.835.158-.152.378-.052.26.11-1.353 1.868-2.915 4.053-2.915 4.053a.31.31 0 0 0-.012.296l1.373 4.256c.264.82.91.82 1.346.06l3.593-6.196c1.118-1.928 2.302-3.935 3.447-5.877 1.056-1.786 2.057-3.645 1.583-4.103a2.24 2.24 0 0 0-1.46-.388z"/>
    <path d="M15.405 20.32c-.173.284-.45.094-.527-.08l-1.666-3.792a.31.31 0 0 1 .016-.285l5.12-8.594"/>
  </svg>
);

const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>
  </svg>
);

const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/>
  </svg>
);

const TrophyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
  </svg>
);

// Constants
const TELEGRAM_LINK = "https://t.me/Naret26";
const PAYMENT_LINK = "https://aba.onelink.me/oRF8/r1z66abs";

// Helper function to shuffle an array (Fisher-Yates)
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Animation Variants
const pageVariants: Variants = {
  initial: { opacity: 0, y: 10, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, y: -10, scale: 0.98, transition: { duration: 0.2 } }
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const App: React.FC = () => {
  // Set initial screen to HOME
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(AppScreen.HOME);
  const [selectedPart, setSelectedPart] = useState<QuizPart | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  // Reset quiz state when starting a part
  const startQuiz = (part: QuizPart) => {
    // 1. Shuffle Questions
    const shuffledQuestions = shuffleArray(part.questions).map(question => {
      // 2. Shuffle Options for each question
      // Create indices array [0, 1, 2, 3]
      const originalOptions = question.options;
      const indices = originalOptions.map((_, i) => i);
      const shuffledIndices = shuffleArray(indices);
      
      // Map new options based on shuffled indices
      const newOptions = shuffledIndices.map(i => originalOptions[i]);
      
      // Find the new index of the correct answer
      // original correct index is question.correctIndex
      // we need to find where that index moved to in shuffledIndices
      const newCorrectIndex = shuffledIndices.indexOf(question.correctIndex);
      
      return {
        ...question,
        options: newOptions,
        correctIndex: newCorrectIndex
      };
    });

    const sessionPart = { ...part, questions: shuffledQuestions };

    setSelectedPart(sessionPart);
    setCurrentQuestionIdx(0);
    setScore(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setCurrentScreen(AppScreen.QUIZ);
  };

  const handleOptionClick = (optionIdx: number) => {
    if (isAnswered || !selectedPart) return;

    setSelectedOption(optionIdx);
    setIsAnswered(true);

    const currentQuestion = selectedPart.questions[currentQuestionIdx];
    if (optionIdx === currentQuestion.correctIndex) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (!selectedPart) return;
    
    if (currentQuestionIdx < selectedPart.questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setCurrentScreen(AppScreen.RESULT);
    }
  };

  const goHome = () => {
    setCurrentScreen(AppScreen.HOME);
    setSelectedPart(null);
  };

  const restartPart = () => {
    if (selectedPart) {
      // Re-find the original part from data to re-shuffle fresh
      const originalPart = quizParts.find(p => p.id === selectedPart.id);
      if (originalPart) {
        startQuiz(originalPart);
      }
    }
  };

  // --- Screens ---

  // 1. Home Screen
  const renderHome = () => (
    <motion.div 
      key="home"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex flex-col h-full"
    >
      <header className="mb-8 text-center mt-6">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          className="inline-block p-4 rounded-full bg-white/5 border border-white/10 mb-4 backdrop-blur-sm shadow-xl"
        >
          <span className="text-4xl">កម្មវិធីអភិវឌ្ឍន៍សមត្ថភាព</span>
        </motion.div>
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-600 mb-2 leading-relaxed drop-shadow-sm"
        >
          សំណួរពហុចម្លើយ<br />ទាក់ទងនឹងយុទ្ធសាស្ត្របញ្ចកោណ<br />ដំណាក់កាលទី 
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.3 }}
          className="text-slate-400 text-sm font-medium"
        >
          (ត្រៀមប្រឡងក្របខ័ណ្ឌ)
        </motion.p>
      </header>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex-1 grid grid-cols-1 gap-4 overflow-y-auto pb-6 px-1"
      >
        {quizParts.map((part) => (
          <motion.button
            key={part.id}
            variants={itemVariants}
            whileHover={{ scale: 1.02, backgroundColor: "rgba(30, 41, 59, 0.8)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => startQuiz(part)}
            className="group relative bg-slate-800/60 hover:bg-slate-800/90 border border-white/5 hover:border-yellow-500/30 backdrop-blur-md text-white font-semibold py-5 px-6 rounded-2xl shadow-lg transition-all duration-300 flex items-center justify-between overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer" />
            <div className="flex items-center gap-4 z-10">
              <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 font-bold border border-blue-500/20">
                {part.id}
              </div>
              <span className="text-lg">{part.title}</span>
            </div>
            <span className="bg-slate-900/80 text-xs px-3 py-1.5 rounded-full text-slate-400 border border-white/5 z-10">
              {part.questions.length} សំណួរ
            </span>
          </motion.button>
        ))}
        
        <motion.a
          variants={itemVariants}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          href={TELEGRAM_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 bg-gradient-to-r from-red-600 to-red-500 text-white font-bold py-5 px-6 rounded-2xl shadow-lg shadow-red-500/20 flex items-center justify-center gap-3 relative overflow-hidden"
        >
           <div className="absolute inset-0 bg-white/20 translate-y-full hover:translate-y-0 transition-transform duration-300" />
          <TelegramIcon />
          <span>ចូលរួមឆាណែល Telegram</span>
        </motion.a>
      </motion.div>
      
      <footer className="mt-4 text-center text-slate-500 text-xs py-4">
        ©ខែធ្នូ ឆ្នាំ២០២៥ រៀបចំដោយ Koun Naret
      </footer>
    </motion.div>
  );

  // 2. Quiz Screen
  const renderQuiz = () => {
    if (!selectedPart) return null;
    const question = selectedPart.questions[currentQuestionIdx];
    const progressPercent = ((currentQuestionIdx + 1) / selectedPart.questions.length) * 100;

    return (
      <motion.div 
        key="quiz"
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="flex flex-col h-full"
      >
        {/* Top Bar */}
        <div className="py-4 px-2 flex items-center justify-between sticky top-0 z-10">
          <motion.button 
            whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.1)" }}
            whileTap={{ scale: 0.9 }}
            onClick={goHome} 
            className="p-2 rounded-full text-slate-400 hover:text-white transition-colors"
          >
            <BackIcon />
          </motion.button>
          <div className="text-slate-200 font-bold text-lg tracking-wide">{selectedPart.title}</div>
          <div className="w-10"></div>
        </div>

        {/* Progress Card */}
        <div className="mx-2 mb-6 bg-slate-800/50 backdrop-blur-md rounded-2xl p-4 border border-white/5 shadow-lg">
           <div className="flex justify-between text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
             <span>វឌ្ឍនភាព</span>
             <span>{currentQuestionIdx + 1} / {selectedPart.questions.length}</span>
           </div>
           <div className="w-full bg-slate-700/50 h-3 rounded-full overflow-hidden">
            <motion.div 
              className="bg-gradient-to-r from-yellow-400 to-orange-500 h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ type: "spring", stiffness: 50, damping: 15 }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-28">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIdx}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="mb-6"
            >
               <h2 className="text-xl md:text-2xl font-bold leading-9 text-white drop-shadow-md">
                {question.question}
              </h2>
            </motion.div>
          </AnimatePresence>

          <div className="space-y-3">
            <AnimatePresence mode='wait'>
            {question.options.map((option, idx) => {
              let btnClass = "relative w-full p-5 rounded-2xl border text-left transition-all duration-300 text-[15px] leading-7 font-medium shadow-md flex items-start gap-3 overflow-hidden ";
              let circleClass = "w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center text-[10px] font-bold mt-0.5 transition-colors duration-300 ";

              if (isAnswered) {
                if (idx === question.correctIndex) {
                  // Correct
                  btnClass += "bg-green-500/20 border-green-500 text-green-50";
                  circleClass += "border-green-400 bg-green-500 text-white";
                } else if (idx === selectedOption && idx !== question.correctIndex) {
                  // Wrong
                  btnClass += "bg-red-500/20 border-red-500 text-red-50 opacity-80";
                  circleClass += "border-red-400 bg-red-500 text-white";
                } else {
                  // Unselected
                  btnClass += "bg-slate-800/40 border-transparent text-slate-500 opacity-50 blur-[0.5px]";
                  circleClass += "border-slate-600 text-slate-600";
                }
              } else {
                // Default
                btnClass += "bg-slate-800/60 border-white/5 text-slate-200 hover:border-yellow-500/50 hover:bg-slate-700/80 hover:shadow-yellow-500/10";
                circleClass += "border-slate-500 text-slate-400 group-hover:border-yellow-400 group-hover:text-yellow-400";
              }

              return (
                <motion.button
                  key={`${currentQuestionIdx}-${idx}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileTap={!isAnswered ? { scale: 0.98 } : {}}
                  onClick={() => handleOptionClick(idx)}
                  disabled={isAnswered}
                  className={btnClass + " group"}
                >
                  <div className={circleClass}>
                    {['ក', 'ខ', 'គ', 'ឃ'][idx]}
                  </div>
                  <span>{option}</span>
                  {isAnswered && idx === question.correctIndex && (
                     <motion.div 
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-green-400"
                     >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                     </motion.div>
                  )}
                </motion.button>
              );
            })}
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 p-4 bg-slate-900/80 backdrop-blur-xl border-t border-white/5 flex justify-center max-w-lg mx-auto z-20"
        >
          <motion.button
            onClick={handleNext}
            disabled={!isAnswered}
            whileTap={{ scale: 0.95 }}
            animate={isAnswered ? { 
                scale: [1, 1.05, 1],
                transition: { repeat: Infinity, duration: 2 } 
            } : {}}
            className={`w-full font-bold py-4 px-6 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 text-lg ${
              isAnswered
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/25"
                : "bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5"
            }`}
          >
            {currentQuestionIdx === selectedPart.questions.length - 1 
              ? "មើលលទ្ធផល" 
              : <>បន្ទាប់ <span className="text-xl">→</span></>}
          </motion.button>
        </motion.div>
      </motion.div>
    );
  }

  // 3. Result Screen
  const renderResult = () => {
    if (!selectedPart) return null;
    const percentage = Math.round((score / selectedPart.questions.length) * 100);
    let feedback = "";
    let feedbackColor = "";

    if (percentage >= 80) {
      feedback = "អស្ចារ្យណាស់! អ្នកពិតជាត្រៀមខ្លួនរួចរាល់ហើយ។";
      feedbackColor = "text-green-400";
    } else if (percentage >= 50) {
      feedback = "ល្អបង្គួរ! ខិតខំប្រឹងប្រែងបន្ថែមទៀត។";
      feedbackColor = "text-yellow-400";
    } else {
      feedback = "ព្យាយាមម្តងទៀត! កុំបោះបង់។";
      feedbackColor = "text-red-400";
    }

    return (
      <motion.div 
        key="result"
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="flex flex-col h-full items-center justify-center text-center p-4 overflow-y-auto"
      >
        <motion.div 
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="mb-8 w-40 h-40 rounded-full border-4 border-slate-700/50 flex flex-col items-center justify-center bg-slate-800/80 backdrop-blur-xl relative shadow-[0_0_50px_-12px_rgba(234,179,8,0.3)] mt-8"
        >
          <motion.div
             animate={{ rotate: 360 }}
             transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
             className="absolute inset-0 rounded-full border-t-4 border-yellow-500/30 w-full h-full"
          />
          <div className="absolute -top-6">
              <TrophyIcon />
          </div>
          <span className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">{score}</span>
          <span className="text-sm text-slate-400 mt-1 font-semibold tracking-widest">ពិន្ទុសរុប</span>
        </motion.div>

        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.3 }}
           className="mb-8"
        >
          <h2 className={`text-3xl font-bold mb-3 ${feedbackColor} drop-shadow-sm`}>
            {percentage}%
          </h2>
          <p className="text-slate-300 max-w-xs mx-auto leading-relaxed">
            {feedback}
          </p>
        </motion.div>

        {/* Payment Support Section */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.4 }}
           className="w-full max-w-sm mb-6 bg-slate-800/50 p-4 rounded-2xl border border-white/5"
        >
           <p className="text-slate-400 text-xs mb-3 font-medium">វិភាគទាន 0.50$ ដើម្បីអភិវឌ្ឍន៍កម្មវិធីបន្តទៀត</p>
           <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            href={PAYMENT_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#005F7F] hover:bg-[#004f6a] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-cyan-900/20 transition-all flex items-center justify-center gap-3 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
            <span className="bg-white text-[#005F7F] text-[10px] font-black px-1.5 py-0.5 rounded">ABA</span>
            <span>វិភាគទានទីនេះ ABA</span>
          </motion.a>
        </motion.div>

        <div className="w-full space-y-3 max-w-sm pb-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={restartPart}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2"
          >
            <RefreshIcon />
            <span>ធ្វើភាគនេះម្ដងទៀត</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={goHome}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-3.5 rounded-xl border border-white/10 transition-all flex items-center justify-center gap-2"
          >
            <HomeIcon />
            <span>ត្រឡប់ទៅដើម</span>
          </motion.button>
          
          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            href={TELEGRAM_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-gradient-to-r from-red-600 to-red-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-red-500/20 transition-all flex items-center justify-center gap-2"
          >
            <TelegramIcon />
            <span>ឆាណែល Telegram</span>
          </motion.a>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-lg mx-auto min-h-screen bg-[#0f172a] md:bg-transparent md:py-8">
       {/* Frame Container for Desktop/Tablet */}
       <div className="bg-[#0f172a] md:bg-slate-900/60 md:backdrop-blur-xl md:border md:border-white/10 min-h-screen md:min-h-[850px] md:h-[90vh] md:rounded-[40px] shadow-2xl overflow-hidden relative flex flex-col">
          <AnimatePresence mode="wait">
            {currentScreen === AppScreen.HOME && renderHome()}
            {currentScreen === AppScreen.QUIZ && renderQuiz()}
            {currentScreen === AppScreen.RESULT && renderResult()}
          </AnimatePresence>
       </div>
    </div>
  );
};

export default App;