import React, { useState, useMemo } from 'react';
import { Plus, Search, ChevronDown, ChevronRight, Calendar, User, CheckCircle, Clock, AlertCircle, Filter, Trash2, Eye, EyeOff } from 'lucide-react';

const PassengerTaskManager = () => {
  const [passengers, setPassengers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedPassengers, setExpandedPassengers] = useState(new Set());
  const [sortBy, setSortBy] = useState('salesperson');
  const [sortOrder, setSortOrder] = useState('asc');
  const [hidePastTravelers, setHidePastTravelers] = useState(false);
  const [newPassenger, setNewPassenger] = useState({
    name: '',
    salesperson: '',
    travelDate: ''
  });

  // Default tasks with their timing - Colombia Welcome Form is now first
  const defaultTasks = [
    { id: 1, name: 'Send the Colombia Welcome Form', daysBefore: null }, // No specific due date - first task
    { id: 2, name: 'Tarjeta de agradecimiento', daysBefore: 30 },
    { id: 3, name: 'Welcome guide', daysBefore: 7 },
    { id: 4, name: 'Guide profiles with map of route and pro tip/fun fact', daysBefore: 3 }
  ];

  const calculateTaskDate = (travelDate, daysBefore) => {
    const travel = new Date(travelDate);
    const taskDate = new Date(travel);
    taskDate.setDate(travel.getDate() - daysBefore);
    return taskDate;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isDateInPast = (date) => {
    const today = new Date();
    const travelDate = new Date(date);
    today.setHours(0, 0, 0, 0);
    travelDate.setHours(0, 0, 0, 0);
    return travelDate < today;
  };

  const getTaskStatus = (taskDate) => {
    if (!taskDate) return 'anytime'; // For tasks without due dates
    
    const today = new Date();
    const task = new Date(taskDate);
    
    today.setHours(0, 0, 0, 0);
    task.setHours(0, 0, 0, 0);
    
    if (task < today) return 'overdue';
    if (task.getTime() === today.getTime()) return 'due-today';
    if (task <= new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000)) return 'due-soon';
    return 'upcoming';
  };

  const addPassenger = () => {
    if (!newPassenger.name || !newPassenger.salesperson || !newPassenger.travelDate) {
      alert('Please fill in all fields');
      return;
    }

    const passenger = {
      id: Date.now(),
      ...newPassenger,
      tasks: defaultTasks.map(task => ({
        ...task,
        dueDate: task.daysBefore ? calculateTaskDate(newPassenger.travelDate, task.daysBefore) : null,
        completed: 'no'
      }))
    };

    setPassengers([...passengers, passenger]);
    setNewPassenger({ name: '', salesperson: '', travelDate: '' });
    setShowAddForm(false);
  };

  const deletePassenger = (passengerId, passengerName) => {
    if (window.confirm(`Are you sure you want to delete ${passengerName}?`)) {
      setPassengers(passengers.filter(p => p.id !== passengerId));
      // Remove from expanded set if it was expanded
      const newExpanded = new Set(expandedPassengers);
      newExpanded.delete(passengerId);
      setExpandedPassengers(newExpanded);
    }
  };

  const updateTaskCompletion = (passengerId, taskId, completion) => {
    setPassengers(passengers.map(passenger => 
      passenger.id === passengerId 
        ? {
            ...passenger,
            tasks: passenger.tasks.map(task =>
              task.id === taskId ? { ...task, completed: completion } : task
            )
          }
        : passenger
    ));
  };

  const togglePassengerExpansion = (passengerId) => {
    const newExpanded = new Set(expandedPassengers);
    if (newExpanded.has(passengerId)) {
      newExpanded.delete(passengerId);
    } else {
      newExpanded.add(passengerId);
    }
    setExpandedPassengers(newExpanded);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'overdue': return 'bg-red-100 text-red-800 border-red-300';
      case 'due-today': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'due-soon': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'anytime': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const getTaskProgress = (tasks) => {
    const completed = tasks.filter(task => task.completed === 'yes').length;
    const total = tasks.length;
    return { completed, total, percentage: (completed / total) * 100 };
  };

  // Filtered and sorted passengers
  const filteredAndSortedPassengers = useMemo(() => {
    let filtered = passengers.filter(passenger => {
      const matchesSearch = passenger.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           passenger.salesperson.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (hidePastTravelers) {
        return matchesSearch && !isDateInPast(passenger.travelDate);
      }
      
      return matchesSearch;
    });

    return filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'salesperson':
          aValue = a.salesperson.toLowerCase();
          bValue = b.salesperson.toLowerCase();
          break;
        case 'travelDate':
          aValue = new Date(a.travelDate);
          bValue = new Date(b.travelDate);
          break;
        default:
          aValue = a.salesperson.toLowerCase();
          bValue = b.salesperson.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [passengers, searchTerm, sortBy, sortOrder, hidePastTravelers]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getSalespersonColor = (salesperson) => {
    const colors = [
      'bg-purple-100 text-purple-800 border-purple-300',
      'bg-pink-100 text-pink-800 border-pink-300',
      'bg-indigo-100 text-indigo-800 border-indigo-300',
      'bg-teal-100 text-teal-800 border-teal-300',
      'bg-emerald-100 text-emerald-800 border-emerald-300',
      'bg-cyan-100 text-cyan-800 border-cyan-300',
      'bg-violet-100 text-violet-800 border-violet-300',
      'bg-rose-100 text-rose-800 border-rose-300',
    ];
    const hash = salesperson.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            <h1 className="text-5xl font-bold mb-2">Passenger Task Manager</h1>
          </div>
          <p className="text-slate-600 text-xl">Manage passenger onboarding tasks and timelines</p>
          <div className="mt-4 flex justify-center">
            <div className="bg-white rounded-full px-6 py-2 shadow-sm border border-slate-200">
              <span className="text-slate-700 font-medium">
                {passengers.length} Total Passengers • {passengers.filter(p => !isDateInPast(p.travelDate)).length} Active
              </span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search passengers or salespeople..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
              />
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Hide Past Travelers Toggle */}
              <button
                onClick={() => setHidePastTravelers(!hidePastTravelers)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all ${
                  hidePastTravelers 
                    ? 'bg-blue-100 border-blue-300 text-blue-800' 
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {hidePastTravelers ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {hidePastTravelers ? 'Show All' : 'Hide Past'}
              </button>

              {/* Sort Controls */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="salesperson">Sort by Salesperson</option>
                  <option value="name">Sort by Name</option>
                  <option value="travelDate">Sort by Travel Date</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2.5 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>

              {/* Add Button */}
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Passenger
              </button>
            </div>
          </div>
        </div>

        {/* Add Passenger Form */}
        {showAddForm && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl shadow-lg border-2 border-blue-200 p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6 text-slate-800">Add New Passenger</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Passenger Name
                </label>
                <input
                  type="text"
                  value={newPassenger.name}
                  onChange={(e) => setNewPassenger({...newPassenger, name: e.target.value})}
                  className="w-full p-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                  placeholder="Enter passenger name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Salesperson
                </label>
                <input
                  type="text"
                  value={newPassenger.salesperson}
                  onChange={(e) => setNewPassenger({...newPassenger, salesperson: e.target.value})}
                  className="w-full p-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                  placeholder="Enter salesperson name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Travel Date
                </label>
                <input
                  type="date"
                  value={newPassenger.travelDate}
                  onChange={(e) => setNewPassenger({...newPassenger, travelDate: e.target.value})}
                  className="w-full p-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                />
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button
                onClick={addPassenger}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all font-semibold shadow-lg"
              >
                Add Passenger
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="bg-gradient-to-r from-slate-400 to-slate-500 text-white px-8 py-3 rounded-xl hover:from-slate-500 hover:to-slate-600 transition-all font-semibold shadow-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Passengers Table */}
        {filteredAndSortedPassengers.length === 0 ? (
          <div className="text-center py-20 bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl shadow-lg border-2 border-slate-200">
            <User className="w-20 h-20 text-slate-400 mx-auto mb-6" />
            <p className="text-slate-500 text-xl mb-4">
              {searchTerm ? 'No passengers found matching your search.' : 'No passengers added yet.'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-lg"
              >
                Add your first passenger
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
            {/* Table Header */}
            <div className="bg-gradient-to-r from-slate-100 to-blue-100 border-b-2 border-slate-200 px-6 py-5">
              <div className="grid grid-cols-12 gap-4 items-center font-bold text-slate-700">
                <div className="col-span-1"></div>
                <div 
                  className="col-span-2 cursor-pointer hover:text-slate-900 transition-colors flex items-center gap-1"
                  onClick={() => handleSort('name')}
                >
                  Passenger {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </div>
                <div 
                  className="col-span-2 cursor-pointer hover:text-slate-900 transition-colors flex items-center gap-1"
                  onClick={() => handleSort('salesperson')}
                >
                  Salesperson {sortBy === 'salesperson' && (sortOrder === 'asc' ? '↑' : '↓')}
                </div>
                <div 
                  className="col-span-2 cursor-pointer hover:text-slate-900 transition-colors flex items-center gap-1"
                  onClick={() => handleSort('travelDate')}
                >
                  Travel Date {sortBy === 'travelDate' && (sortOrder === 'asc' ? '↑' : '↓')}
                </div>
                <div className="col-span-2">Progress</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-1">Actions</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-slate-100">
              {filteredAndSortedPassengers.map((passenger, index) => {
                const progress = getTaskProgress(passenger.tasks);
                const isExpanded = expandedPassengers.has(passenger.id);
                const isPastTravel = isDateInPast(passenger.travelDate);
                const urgentTasks = passenger.tasks.filter(task => 
                  task.completed === 'no' && 
                  task.dueDate && // Only count tasks with due dates as urgent
                  (getTaskStatus(task.dueDate) === 'overdue' || getTaskStatus(task.dueDate) === 'due-today')
                ).length;

                return (
                  <div key={passenger.id}>
                    {/* Passenger Row */}
                    <div 
                      className={`px-6 py-5 transition-all ${
                        index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                      } ${isPastTravel ? 'opacity-60' : ''} hover:bg-blue-50`}
                    >
                      <div className="grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-1">
                          <button 
                            onClick={() => togglePassengerExpansion(passenger.id)}
                            className="p-1 hover:bg-slate-200 rounded-lg transition-colors"
                          >
                            {isExpanded ? 
                              <ChevronDown className="w-5 h-5 text-slate-600" /> : 
                              <ChevronRight className="w-5 h-5 text-slate-600" />
                            }
                          </button>
                        </div>
                        
                        <div className="col-span-2">
                          <div className="font-semibold text-slate-800 text-lg">{passenger.name}</div>
                          {isPastTravel && (
                            <span className="text-xs text-slate-500 italic">Past traveler</span>
                          )}
                        </div>
                        
                        <div className="col-span-2">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getSalespersonColor(passenger.salesperson)}`}>
                            <User className="w-3 h-3" />
                            {passenger.salesperson}
                          </span>
                        </div>
                        
                        <div className="col-span-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span className={`font-medium ${isPastTravel ? 'text-slate-500' : 'text-slate-700'}`}>
                              {formatDate(new Date(passenger.travelDate))}
                            </span>
                          </div>
                        </div>
                        
                        <div className="col-span-2">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 bg-slate-200 rounded-full h-3 shadow-inner">
                              <div 
                                className={`h-3 rounded-full transition-all duration-500 ${
                                  progress.percentage === 100 ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                                  progress.percentage >= 66 ? 'bg-gradient-to-r from-blue-400 to-cyan-500' :
                                  progress.percentage >= 33 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                                  'bg-gradient-to-r from-red-400 to-pink-500'
                                }`}
                                style={{ width: `${progress.percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-slate-700 font-bold min-w-max">
                              {progress.completed}/{progress.total}
                            </span>
                          </div>
                        </div>
                        
                        <div className="col-span-2">
                          {urgentTasks > 0 ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-300 shadow-sm">
                              <AlertCircle className="w-4 h-4" />
                              {urgentTasks} Urgent
                            </span>
                          ) : progress.percentage === 100 ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-300 shadow-sm">
                              <CheckCircle className="w-4 h-4" />
                              Complete
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border border-blue-300 shadow-sm">
                              <Clock className="w-4 h-4" />
                              In Progress
                            </span>
                          )}
                        </div>

                        <div className="col-span-1">
                          <button
                            onClick={() => deletePassenger(passenger.id, passenger.name)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete passenger"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Tasks */}
                    {isExpanded && (
                      <div className="bg-gradient-to-r from-slate-50 to-blue-50 border-t-2 border-slate-200">
                        <div className="px-6 py-6">
                          <h4 className="text-lg font-bold text-slate-800 mb-4">Tasks for {passenger.name}</h4>
                          <div className="grid gap-4">
                            {passenger.tasks.map(task => {
                              const status = getTaskStatus(task.dueDate);
                              return (
                                <div key={task.id} className="flex items-center justify-between bg-white p-5 rounded-xl border-2 border-slate-200 shadow-sm hover:shadow-md transition-all">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      <span className={`px-3 py-1 rounded-full text-sm font-semibold border-2 ${getStatusColor(status)}`}>
                                        {status === 'overdue' ? 'Overdue' : 
                                         status === 'due-today' ? 'Due Today' :
                                         status === 'due-soon' ? 'Due Soon' : 
                                         status === 'anytime' ? 'Anytime' : 'Upcoming'}
                                      </span>
                                    </div>
                                    <h5 className="font-bold text-slate-800 text-lg mb-1">{task.name}</h5>
                                    {task.dueDate ? (
                                      <p className="text-slate-600 font-medium">
                                        Due: {formatDate(task.dueDate)} ({task.daysBefore} days before travel)
                                      </p>
                                    ) : (
                                      <p className="text-slate-600 font-medium">
                                        Complete anytime (no specific due date)
                                      </p>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center gap-3">
                                    {task.completed === 'yes' && (
                                      <CheckCircle className="w-6 h-6 text-green-500" />
                                    )}
                                    <select
                                      value={task.completed}
                                      onChange={(e) => updateTaskCompletion(passenger.id, task.id, e.target.value)}
                                      className={`px-4 py-2 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all font-semibold ${
                                        task.completed === 'yes' ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 text-green-800' :
                                        'bg-white border-slate-300 text-slate-800'
                                      }`}
                                    >
                                      <option value="no">Not Complete</option>
                                      <option value="yes">Complete</option>
                                    </select>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PassengerTaskManager;
