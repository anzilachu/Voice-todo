import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import Image from 'next/image';
import ReactConfetti from 'react-confetti';
import { Todo } from '../types';
import { useSession } from 'next-auth/react';

interface TodoListProps {
  onTasksCreated: (tasks: string[]) => void;
}

interface TodoItemProps {
  todo: Todo;
  status: 'pending' | 'completed' | 'overdue';
  onUpdate: (id: number, updates: Partial<Todo>) => void;
  onDelete: (id: number) => void;
}

const TodoItem = ({ todo, status, onUpdate, onDelete }: TodoItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingTitle, setEditingTitle] = useState(todo.title);
  const [isExpanded, setIsExpanded] = useState(false);
  const taskRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (window.innerWidth < 640 && taskRef.current && !taskRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggleComplete = () => {
    const now = new Date().toISOString();
    if (status === 'overdue') {
      // For overdue tasks, update the creation date to today and keep it uncompleted
      onUpdate(todo.id, { 
        createdAt: now,
        updatedAt: now,
        completed: false  // Ensure it stays uncompleted
      });
    } else {
      // For other tasks, just toggle completion
      onUpdate(todo.id, { 
        completed: !todo.completed,
        updatedAt: now
      });
    }
  };

  const handleAddToCalendar = () => {
    // Format the task for Google Calendar
    const text = encodeURIComponent(todo.title);
    const details = encodeURIComponent(`Task from Voice Todo\nEstimated time: ${todo.estimatedTime} minutes`);
    
    // Create a date 1 hour from now for the event
    const startTime = new Date();
    startTime.setHours(startTime.getHours() + 1);
    const endTime = new Date(startTime.getTime() + todo.estimatedTime * 60000);
    
    const start = startTime.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const end = endTime.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    
    // Open Google Calendar in a new tab
    window.open(
      `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&details=${details}&dates=${start}/${end}`,
      '_blank'
    );
  };

  const handleEdit = () => {
    if (status === 'completed' || status === 'overdue') return;
    setIsEditing(true);
    setEditingTitle(todo.title);
  };

  const handleSave = () => {
    const trimmedTitle = editingTitle.trim();
    if (trimmedTitle) {
      onUpdate(todo.id, { title: trimmedTitle, updatedAt: new Date().toISOString() });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingTitle(todo.title);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleTaskClick = (e: React.MouseEvent) => {
    if (status === 'pending' && window.innerWidth < 640) {
      setIsExpanded(!isExpanded);
    }
  };

  const statusColors = {
    pending: 'bg-white border-gray-200 hover:border-gray-400 hover:bg-gray-50',
    overdue: 'bg-gray-50 border-gray-200 hover:border-gray-400 hover:bg-gray-100',
    completed: 'bg-gray-50 border-gray-200 hover:border-gray-300 hover:bg-gray-100'
  };

  const checkboxColors = {
    pending: 'text-gray-900 border-gray-300 focus:ring-gray-900',
    overdue: 'text-gray-900 border-gray-300 focus:ring-gray-900',
    completed: 'text-gray-400 border-gray-300 focus:ring-gray-400'
  };

  const buttonColors = {
    pending: 'text-gray-400 hover:text-gray-900',
    overdue: 'text-gray-400 hover:text-gray-900',
    completed: 'text-gray-400 hover:text-gray-600'
  };

  return (
    <div className={`group relative p-4 rounded-xl border transition-all duration-200 shadow-sm hover:shadow-md ${statusColors[status]}`} ref={taskRef}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-5">
          {status === 'completed' ? (
            <button
              onClick={handleToggleComplete}
              className={`w-5 h-5 ${buttonColors[status]} transition-colors duration-200`}
              title="Move to Current Tasks"
            >
              <svg className="w-5 h-5 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>
          ) : status === 'overdue' ? (
            <button
              onClick={handleToggleComplete}
              className={`w-5 h-5 ${buttonColors[status]} transition-colors duration-200`}
              title="Move to Today's Tasks"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button>
          ) : (
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={handleToggleComplete}
              className={`w-5 h-5 rounded-md ${checkboxColors[status]} transition-colors duration-200`}
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          {isEditing && status !== 'completed' && status !== 'overdue' ? (
            <div className="flex flex-col gap-3 w-full">
              <input
                type="text"
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                className="w-full px-2 py-1 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                autoFocus
                onKeyDown={handleKeyDown}
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={handleSave}
                  disabled={!editingTitle.trim()}
                  className="px-3 py-1 text-sm text-white bg-gray-900 rounded hover:bg-gray-800 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <div 
                className="flex items-start justify-between gap-3 cursor-pointer" 
                onClick={handleTaskClick}
              >
                <span className={`text-base leading-normal ${todo.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                  {todo.title}
                  {status === 'pending' && (
                    <span className="sm:hidden inline-flex ml-2 px-2 py-0.5 text-sm rounded-full bg-gray-100 text-gray-600 font-medium">
                      {todo.estimatedTime}min
                    </span>
                  )}
                </span>
                {status === 'pending' && (
                  <span className={`hidden sm:inline-flex flex-shrink-0 px-2 py-0.5 text-sm rounded-full bg-gray-100 text-gray-600 font-medium whitespace-nowrap`}>
                    {todo.estimatedTime}min
                  </span>
                )}
              </div>
              {status === 'pending' && isExpanded && (
                <div className="flex items-center gap-2 pl-2 pt-1 sm:hidden">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCalendar();
                    }}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 transition-colors duration-200"
                    title="Add to Google Calendar"
                  >
                    <img
                      width="20"
                      height="20"
                      src="https://img.icons8.com/color/48/google-calendar--v2.png"
                      alt="Google Calendar"
                      className="w-4 h-4"
                    />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {status === 'pending' && (
            <button
              onClick={handleAddToCalendar}
              className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${buttonColors[status]} hidden sm:block`}
              title="Add to Google Calendar"
            >
              <img
                width="20"
                height="20"
                src="https://img.icons8.com/color/48/google-calendar--v2.png"
                alt="Google Calendar"
                className="w-4 h-4"
              />
            </button>
          )}
          {status !== 'completed' && status !== 'overdue' && (
            <>
              <button
                onClick={handleEdit}
                className={`p-1.5 rounded-lg ${buttonColors[status]} transition-colors duration-200`}
                title="Edit"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => onDelete(todo.id)}
                className={`p-1.5 rounded-lg ${buttonColors[status]} transition-colors duration-200`}
                title="Delete"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </>
          )}
          {(status === 'completed' || status === 'overdue') && (
            <button
              onClick={() => onDelete(todo.id)}
              className={`p-1.5 rounded-lg ${buttonColors[status]} transition-colors duration-200`}
              title="Delete"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const TodoList = forwardRef<{ handleTasksCreated: (tasks: string[]) => void }, TodoListProps>(
  (props, ref) => {
    const { data: session } = useSession();
    const [todos, setTodos] = useState<Todo[]>([]);
    const [showCelebration, setShowCelebration] = useState(false);
    const [windowSize, setWindowSize] = useState({
      width: typeof window !== 'undefined' ? window.innerWidth : 0,
      height: typeof window !== 'undefined' ? window.innerHeight : 0
    });

    useEffect(() => {
      const handleResize = () => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight
        });
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
      fetchTodos();
    }, []);

    useImperativeHandle(ref, () => ({
      handleTasksCreated
    }));

    const fetchTodos = async () => {
      if (!session?.user) return;
      try {
        const response = await fetch('/api/todos');
        const data = await response.json();
        console.log('Fetched todos:', data); // Debug log
        if (!Array.isArray(data)) {
          console.error('Todos is not an array:', data);
          setTodos([]);
          return;
        }
        setTodos(data);
      } catch (error) {
        console.error('Failed to fetch todos:', error);
        setTodos([]); // Set empty array on error
      }
    };

    const addTodo = async (title: string, estimatedTime: number) => {
      if (!session?.user) return;
      try {
        const response = await fetch('/api/todos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title, estimatedTime }),
        });
        const newTodo = await response.json();
        setTodos(prev => [...prev, newTodo]);
      } catch (error) {
        console.error('Failed to add todo:', error);
      }
    };

    const updateTodo = async (id: number, updates: Partial<Todo>) => {
      if (!session?.user) return;
      try {
        const response = await fetch(`/api/todos/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });

        if (!response.ok) throw new Error('Failed to update todo');

        const updatedTodo = await response.json();
        setTodos(prevTodos => {
          const newTodos = prevTodos.map(todo =>
            todo.id === id ? { ...todo, ...updatedTodo } : todo
          );
          
          // Check if all tasks for today are completed
          const todayStart = new Date();
          todayStart.setHours(0, 0, 0, 0);
          const todayEnd = new Date();
          todayEnd.setHours(23, 59, 59, 999);
          
          const todayTodos = newTodos.filter(todo => {
            const todoDate = new Date(todo.createdAt);
            return todoDate >= todayStart && todoDate <= todayEnd;
          });
          
          const allCompleted = todayTodos.length > 0 && todayTodos.every(todo => todo.completed);
          if (allCompleted) {
            setShowCelebration(true);
            setTimeout(() => setShowCelebration(false), 5000); // Hide after 5 seconds
          }
          
          return newTodos;
        });
      } catch (error) {
        console.error('Error updating todo:', error);
      }
    };

    const deleteTodo = async (id: number) => {
      if (!session?.user) return;
      try {
        const response = await fetch(`/api/todos/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error(`Failed to delete todo: ${response.statusText}`);
        }
        await response.json(); // Make sure to read the response
        setTodos(prev => prev.filter(todo => todo.id !== id));
      } catch (error) {
        console.error('Failed to delete todo:', error);
      }
    };

    const handleTasksCreated = async (tasks: string[]) => {
      try {
        // Create each task in the database
        for (const task of tasks) {
          const timeMatch = task.match(/\((\d+)\s*(?:min|hour|hr)s?\)/);
          const estimatedTime = timeMatch ? parseInt(timeMatch[1]) : 30;
          const title = task.replace(/\(\d+\s*(?:min|hour|hr)s?\)/, '').trim();
          
          await fetch('/api/todos', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, estimatedTime }),
          });
        }
        
        // Refresh the todo list
        fetchTodos();
      } catch (error) {
        console.error('Failed to create tasks:', error);
      }
    };

    const isOverdue = (todo: Todo) => {
      if (!todo.createdAt || todo.completed) return false;
      const createdDate = new Date(todo.createdAt);
      const now = new Date();
      const diffHours = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60);
      return diffHours >= 24;
    };

    // Filter todos into categories
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const sortedTodos = [...todos].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const todayTodos = sortedTodos.filter(todo => {
      const todoDate = new Date(todo.createdAt);
      return todoDate >= todayStart && todoDate <= todayEnd;
    });

    const uncompletedPastTodos = sortedTodos.filter(todo => {
      const todoDate = new Date(todo.createdAt);
      return !todo.completed && todoDate < todayStart;
    });

    // Calculate progress percentage
    const progressPercentage = todayTodos.length > 0 
      ? Math.round((todayTodos.filter(todo => todo.completed).length / todayTodos.length) * 100)
      : 0;

    const handleDragEnd = (result: DropResult) => {
      if (!result.destination) return;
      
      const items = Array.from(todos);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);
      
      setTodos(items);
      
      // Update the order in the database
      items.forEach(async (todo, index) => {
        await updateTodo(todo.id, { order: index });
      });
    };

    return (
      <div className="space-y-8 max-w-3xl mx-auto px-4 py-8">
        {showCelebration && (
          <ReactConfetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={false}
            numberOfPieces={200}
            onConfettiComplete={() => setShowCelebration(false)}
          />
        )}

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="text-sm font-medium text-gray-600">
              {progressPercentage === 100 
                ? "🎉 All tasks completed!"
                : `${todayTodos.filter(todo => todo.completed).length} of ${todayTodos.length} tasks completed`
              }
            </div>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-gray-900 to-gray-700 transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Today's Tasks */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium text-gray-900">Today's Tasks</h2>
            {todayTodos.length > 0 && (
              <div className="text-sm font-medium text-gray-500">
                {progressPercentage === 100 
                  ? "🎉 All tasks completed!"
                  : `${todayTodos.filter(todo => todo.completed).length} of ${todayTodos.length} tasks completed`
                }
              </div>
            )}
          </div>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="today-todos">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-3"
                >
                  {todayTodos.length > 0 ? (
                    <>
                      {todayTodos.map((todo, index) => (
                        <Draggable
                          key={todo.id}
                          draggableId={todo.id.toString()}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <TodoItem
                                todo={todo}
                                status={todo.completed ? 'completed' : 'pending'}
                                onUpdate={updateTodo}
                                onDelete={deleteTodo}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                      <svg 
                        className="w-12 h-12 mx-auto text-gray-400 mb-4" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth="1.5" 
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No tasks yet</h3>
                      <p className="text-gray-500">Click the microphone above to add your first task</p>
                    </div>
                  )}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        {/* Past Uncompleted Tasks */}
        {uncompletedPastTodos.length > 0 && (
          <div className="space-y-4 mt-8">
            <h2 className="text-xl font-medium text-gray-900">Past Uncompleted Tasks</h2>
            <div className="space-y-3">
              {uncompletedPastTodos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  status="overdue"
                  onUpdate={updateTodo}
                  onDelete={deleteTodo}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
);

TodoList.displayName = 'TodoList';

export default TodoList;
