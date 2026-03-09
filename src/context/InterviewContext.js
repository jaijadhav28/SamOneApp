import React, { createContext, useState, useContext } from 'react';

const InterviewContext = createContext();

export const useInterview = () => useContext(InterviewContext);

export const InterviewProvider = ({ children }) => {
    const [score, setScore] = useState(0);
    const [violations, setViolations] = useState(0);
    const [answers, setAnswers] = useState([]);

    return (
        <InterviewContext.Provider value={{
            score, setScore,
            violations, setViolations,
            answers, setAnswers
        }}>
            {children}
        </InterviewContext.Provider>
    );
};
