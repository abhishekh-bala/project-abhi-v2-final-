import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Winner } from '../types';

interface TicketRevealProps {
  isVisible: boolean;
  winner: Winner | null;
  onComplete: () => void;
}

export const TicketReveal: React.FC<TicketRevealProps> = ({ isVisible, winner, onComplete }) => {
  const [revealedDigits, setRevealedDigits] = useState<string[]>([]);
  const [showFullNumber, setShowFullNumber] = useState(false);
  const [spinningNumbers, setSpinningNumbers] = useState<number[][]>([]);
  
  useEffect(() => {
    if (isVisible && winner) {
      const ticketString = winner.ticket.toString();
      const digits = ticketString.split('').map(Number);
      
      // Initialize spinning numbers for each digit
      setSpinningNumbers(
        digits.map(() => 
          Array.from({ length: 20 }, () => Math.floor(Math.random() * 10))
        )
      );
      
      let currentIndex = 0;
      setRevealedDigits([]);
      setShowFullNumber(false);
      
      const interval = setInterval(() => {
        if (currentIndex < ticketString.length) {
          setRevealedDigits(prev => [...prev, ticketString[currentIndex]]);
          currentIndex++;
        } else {
          clearInterval(interval);
          setShowFullNumber(true);
          setTimeout(onComplete, 2000);
        }
      }, 4000);

      return () => {
        clearInterval(interval);
        setRevealedDigits([]);
        setShowFullNumber(false);
        setSpinningNumbers([]);
      };
    }
  }, [isVisible, winner, onComplete]);

  if (!isVisible || !winner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/90 backdrop-blur-sm rounded-2xl p-12 max-w-2xl w-full mx-4 text-center relative overflow-hidden"
        >
          {/* Animated background */}
          <motion.div
            className="absolute inset-0"
            animate={{
              background: [
                "linear-gradient(0deg, rgba(168,85,247,0.1), rgba(236,72,153,0.1))",
                "linear-gradient(90deg, rgba(236,72,153,0.1), rgba(168,85,247,0.1))",
                "linear-gradient(180deg, rgba(168,85,247,0.1), rgba(236,72,153,0.1))",
                "linear-gradient(270deg, rgba(236,72,153,0.1), rgba(168,85,247,0.1))",
              ],
            }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          
          <div className="relative">
            <motion.h2
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-4xl font-bold mb-12 bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text"
            >
              Revealing Winning Ticket
            </motion.h2>
            
            <div className="flex justify-center gap-4 mb-12 perspective">
              {winner.ticket.toString().split('').map((digit, index) => (
                <motion.div
                  key={index}
                  initial={{ rotateX: 0 }}
                  animate={
                    revealedDigits[index] || showFullNumber
                      ? { rotateX: 0 }
                      : {
                          rotateX: [0, 360, 720, 1080, 1440],
                          transition: {
                            duration: 2,
                            repeat: Infinity,
                            ease: "linear",
                          }
                        }
                  }
                  className="w-20 h-24 relative"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-xl flex items-center justify-center transform-gpu"
                    animate={
                      revealedDigits[index] || showFullNumber
                        ? {
                            scale: [1, 1.2, 1],
                            rotateY: [0, 360],
                            transition: {
                              duration: 1,
                              times: [0, 0.5, 1],
                              type: "spring",
                              stiffness: 200,
                            }
                          }
                        : {
                            rotateY: [0, 360],
                            transition: {
                              duration: 2,
                              repeat: Infinity,
                              ease: "linear",
                            }
                          }
                    }
                  >
                    <span className="text-5xl font-bold text-white font-space-grotesk">
                      {revealedDigits[index] || showFullNumber
                        ? digit
                        : spinningNumbers[index]?.[Math.floor(Date.now() / 100) % 20] || '?'}
                    </span>
                  </motion.div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              {showFullNumber ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                  }}
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="text-3xl font-bold text-gradient"
                  >
                    Congratulations {winner.guide.name}!
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  animate={{
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="text-xl text-purple-600 font-medium"
                >
                  Spinning the lucky numbers...
                </motion.div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};