import { useState } from 'react';
import { MessageSquare, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Business } from '../types';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';

interface BusinessQAProps {
  business: Business;
}

interface Question {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
  answers: Answer[];
}

interface Answer {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
  isOfficial: boolean;
  upvotes: number;
  downvotes: number;
  userVote?: 'up' | 'down';
}

export function BusinessQA({ business }: BusinessQAProps) {
  const { user } = useAuthStore();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [showAnswerForm, setShowAnswerForm] = useState<string | null>(null);
  const [newAnswer, setNewAnswer] = useState('');

  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to ask a question');
      return;
    }

    if (!newQuestion.trim()) {
      toast.error('Please enter a question');
      return;
    }

    const question: Question = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      userName: user.name,
      content: newQuestion.trim(),
      createdAt: new Date().toISOString(),
      answers: [],
    };

    setQuestions([question, ...questions]);
    setNewQuestion('');
    toast.success('Question posted successfully');
  };

  const handleAddAnswer = (questionId: string) => {
    if (!user) {
      toast.error('Please login to answer');
      return;
    }

    if (!newAnswer.trim()) {
      toast.error('Please enter an answer');
      return;
    }

    const answer: Answer = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      userName: user.name,
      content: newAnswer.trim(),
      createdAt: new Date().toISOString(),
      isOfficial: user.id === business.ownerId,
      upvotes: 0,
      downvotes: 0,
    };

    setQuestions(questions.map(q => 
      q.id === questionId
        ? { ...q, answers: [...q.answers, answer] }
        : q
    ));
    setNewAnswer('');
    setShowAnswerForm(null);
    toast.success('Answer posted successfully');
  };

  const handleVote = (questionId: string, answerId: string, voteType: 'up' | 'down') => {
    if (!user) {
      toast.error('Please login to vote');
      return;
    }

    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          answers: q.answers.map(a => {
            if (a.id === answerId) {
              const previousVote = a.userVote;
              let upvotes = a.upvotes;
              let downvotes = a.downvotes;

              // Remove previous vote if exists
              if (previousVote === 'up') upvotes--;
              if (previousVote === 'down') downvotes--;

              // Add new vote if different from previous
              if (voteType !== previousVote) {
                if (voteType === 'up') upvotes++;
                if (voteType === 'down') downvotes++;
              }

              return {
                ...a,
                upvotes,
                downvotes,
                userVote: voteType === previousVote ? undefined : voteType,
              };
            }
            return a;
          }),
        };
      }
      return q;
    }));
  };

  return (
    <div className="space-y-6">
      {/* Ask Question Form */}
      <form onSubmit={handleAskQuestion} className="space-y-4">
        <div>
          <label
            htmlFor="question"
            className="block text-sm font-medium text-gray-700"
          >
            Ask a Question
          </label>
          <div className="mt-1">
            <textarea
              id="question"
              rows={3}
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              className="shadow-sm block w-full focus:ring-blue-500 focus:border-blue-500 sm:text-sm border border-gray-300 rounded-md"
              placeholder="What would you like to know about this business?"
            />
          </div>
        </div>
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Ask Question
        </button>
      </form>

      {/* Questions List */}
      <div className="space-y-6">
        {questions.length > 0 ? (
          questions.map((question) => (
            <div key={question.id} className="bg-white rounded-lg shadow-sm p-6">
              {/* Question */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="font-medium text-gray-900">
                      {question.userName}
                    </div>
                    <span className="text-gray-500">•</span>
                    <div className="text-sm text-gray-500">
                      {new Date(question.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <p className="text-gray-900">{question.content}</p>
              </div>

              {/* Answers */}
              <div className="mt-6 space-y-4">
                {question.answers.map((answer) => (
                  <div
                    key={answer.id}
                    className={`ml-8 p-4 rounded-lg ${
                      answer.isOfficial
                        ? 'bg-blue-50 border border-blue-100'
                        : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="font-medium text-gray-900">
                          {answer.userName}
                        </div>
                        {answer.isOfficial && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Business Owner
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(answer.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <p className="mt-2 text-gray-900">{answer.content}</p>
                    <div className="mt-2 flex items-center space-x-4">
                      <button
                        onClick={() => handleVote(question.id, answer.id, 'up')}
                        className={`flex items-center space-x-1 ${
                          answer.userVote === 'up'
                            ? 'text-green-600'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <ThumbsUp className="h-4 w-4" />
                        <span className="text-sm">{answer.upvotes}</span>
                      </button>
                      <button
                        onClick={() => handleVote(question.id, answer.id, 'down')}
                        className={`flex items-center space-x-1 ${
                          answer.userVote === 'down'
                            ? 'text-red-600'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <ThumbsDown className="h-4 w-4" />
                        <span className="text-sm">{answer.downvotes}</span>
                      </button>
                    </div>
                  </div>
                ))}

                {/* Answer Form */}
                {showAnswerForm === question.id ? (
                  <div className="ml-8 mt-4">
                    <textarea
                      rows={3}
                      value={newAnswer}
                      onChange={(e) => setNewAnswer(e.target.value)}
                      className="shadow-sm block w-full focus:ring-blue-500 focus:border-blue-500 sm:text-sm border border-gray-300 rounded-md"
                      placeholder="Write your answer..."
                    />
                    <div className="mt-2 flex justify-end space-x-2">
                      <button
                        onClick={() => {
                          setShowAnswerForm(null);
                          setNewAnswer('');
                        }}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleAddAnswer(question.id)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        Post Answer
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAnswerForm(question.id)}
                    className="ml-8 mt-2 flex items-center text-sm text-blue-600 hover:text-blue-700"
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Answer
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500">
            No questions yet. Be the first to ask!
          </div>
        )}
      </div>
    </div>
  );
}