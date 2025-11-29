import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Plus, 
  Minus, 
  Trash2, 
  ChefHat, 
  Search, 
  LayoutDashboard, 
  Coffee, 
  UtensilsCrossed, 
  DollarSign, 
  ListOrdered, 
  X,
  IndianRupee,
  LogOut,
  User,
  Lock,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Zap,
  Tag
} from 'lucide-react';

// --- Mock Data (Indian Canteen Menu) ---
const INITIAL_MENU = [
  { id: 1, name: "Chicken Biryani", category: "Lunch", price: 180, image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=500&q=60" },
  { id: 2, name: "Veg Masala Burger", category: "Snacks", price: 60, image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=500&q=60" },
  { id: 3, name: "Masala Chai", category: "Beverages", price: 20, image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=500&q=60" },
  { id: 4, name: "Masala Dosa", category: "Breakfast", price: 80, image: "https://images.unsplash.com/photo-1589301760576-416cc150973b?auto=format&fit=crop&w=500&q=60" },
  { id: 5, name: "Mango Lassi", category: "Beverages", price: 50, image: "https://images.unsplash.com/photo-1553530666-ba11a90696f9?auto=format&fit=crop&w=500&q=60" },
  { id: 6, name: "Paneer Butter Masala", category: "Lunch", price: 150, image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=500&q=60" },
  { id: 7, name: "Samosa (2 pcs)", category: "Snacks", price: 30, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=500&q=60" },
  { id: 8, name: "Chole Bhature", category: "Lunch", price: 120, image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=500&q=60" },
];

export default function CanteenApp() {
  // --- Auth State ---
  const [user, setUser] = useState(null); // { name: string, role: 'admin' | 'user' }
  const [loginData, setLoginData] = useState({ username: '', password: '' });

  // --- App State ---
  const [view, setView] = useState('home'); // home, cart, admin
  const [menu, setMenu] = useState(INITIAL_MENU);
  const [cart, setCart] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Admin Form State
  const [newItem, setNewItem] = useState({ name: '', price: '', category: 'Lunch', image: '' });
  const [specialSuggestion, setSpecialSuggestion] = useState(null); // LLM generated suggestion

  // --- Auth Logic ---
  const handleLogin = (e) => {
    e.preventDefault();
    // Dummy Authentication Logic
    if (loginData.username === 'admin' && loginData.password === 'admin') {
      setUser({ name: 'Manager', role: 'admin' });
      setView('admin');
    } else {
      // Default to regular user for any other input
      setUser({ name: loginData.username || 'Foodie', role: 'user' });
      setView('home');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setLoginData({ username: '', password: '' });
    setCart([]);
    setView('home');
  };

  // --- Cart Logic ---
  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(i => {
      if (i.id === id) {
        return { ...i, qty: Math.max(1, i.qty + delta) };
      }
      return i;
    }));
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    const newOrder = {
      id: Date.now(),
      items: cart,
      total: cartTotal,
      date: new Date().toLocaleString('en-IN'),
      status: 'Pending',
      user: user.name
    };
    setOrders([newOrder, ...orders]);
    setCart([]);
    setView('success');
    setTimeout(() => setView('home'), 3000);
  };

  // --- Admin Logic ---
  const handleAddItem = (e) => {
    e.preventDefault();
    const item = {
      id: Date.now(),
      name: newItem.name,
      price: parseFloat(newItem.price),
      category: newItem.category,
      image: newItem.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=60"
    };
    setMenu([item, ...menu]);
    setNewItem({ name: '', price: '', category: 'Lunch', image: '' });
  };

  const deleteItem = (id) => {
    setMenu(menu.filter(item => item.id !== id));
  };

  // --- Filtering ---
  const filteredMenu = menu.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = ['All', ...new Set(menu.map(i => i.category))];


  // --- LLM API CALLER ---

  const callGeminiApi = async (prompt, schema) => {
      const apiKey = ""; 
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

      const payload = {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
              responseMimeType: "application/json",
              responseSchema: schema
          },
      };

      const maxRetries = 5;
      let delay = 1000;

      for (let i = 0; i < maxRetries; i++) {
          try {
              const response = await fetch(apiUrl, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload)
              });

              if (!response.ok) {
                  throw new Error(`HTTP error! status: ${response.status}`);
              }

              const result = await response.json();
              
              if (result.candidates && result.candidates.length > 0 &&
                  result.candidates[0].content && result.candidates[0].content.parts &&
                  result.candidates[0].content.parts.length > 0) {
                  const jsonString = result.candidates[0].content.parts[0].text;
                  return JSON.parse(jsonString);
              }
              throw new Error("Invalid response structure from API.");

          } catch (error) {
              if (i === maxRetries - 1) {
                  console.error("Gemini API call failed after multiple retries:", error);
                  throw error;
              }
              // Exponential backoff
              await new Promise(resolve => setTimeout(resolve, delay));
              delay *= 2;
          }
      }
  };


  // --- Chef's Special Generator Component (LLM Feature) ---
  const ChefSpecialGenerator = ({ menuItems, onNewItemGenerated }) => {
    const [isLoading, setIsLoading] = useState(false);

    const specialSchema = {
        type: "OBJECT",
        properties: {
            "specialName": { 
                "type": "STRING", 
                "description": "A creative, appealing name for the canteen special, e.g., 'Hyderabadi Delight'."
            },
            "description": { 
                "type": "STRING", 
                "description": "A 1-2 sentence, mouth-watering description." 
            },
            "tagline": { 
                "type": "STRING", 
                "description": "A short, punchy marketing tagline, e.g., 'Spice up your lunch break!'" 
            }
        },
        required: ["specialName", "description", "tagline"]
    };

    const generateSpecial = async () => {
        setIsLoading(true);
        setSpecialSuggestion(null); // Clear previous suggestion

        const menuList = menuItems.map(item => item.name).join(', ');
        const prompt = `Based on the following Indian-style canteen menu items: ${menuList}. Generate a brand new, unique 'Chef's Special' concept for today's lunch. The suggestion must fit the existing Indian/fusion cuisine style and be highly appealing to students/employees. Provide only the special name, a brief description, and a marketing tagline.`;

        try {
            const suggestion = await callGeminiApi(prompt, specialSchema);
            setSpecialSuggestion(suggestion);
        } catch (error) {
            console.error("Failed to generate Chef's Special:", error);
            // Display an error message to the user
            setSpecialSuggestion({ 
                error: true, 
                message: "Could not generate special. API call failed." 
            });
        } finally {
            setIsLoading(false);
        }
    };

    const useSpecialSuggestion = () => {
        if (!specialSuggestion || specialSuggestion.error) return;
        // Pre-fill the Add New Item form with the suggestion
        setNewItem({ 
            name: specialSuggestion.specialName, 
            price: '', // Let manager set the price
            category: 'Lunch', 
            image: '' 
        });
        setSpecialSuggestion(null); // Clear suggestion after use
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
            <h3 className="font-bold text-lg mb-4 border-b pb-2 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" /> Chef's Special Generator
            </h3>

            <p className="text-sm text-gray-600 mb-4">
                Use AI to generate creative and appealing new menu specials based on your current offerings.
            </p>

            <button 
                onClick={generateSpecial}
                disabled={isLoading}
                className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition disabled:bg-purple-400 flex items-center justify-center gap-2"
            >
                {isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                    <Zap className="h-4 w-4" />
                )}
                {isLoading ? 'Generating Idea...' : 'Generate New Special Idea'}
            </button>

            {specialSuggestion && (
                <div className="mt-6 p-4 bg-purple-50 border-l-4 border-purple-400 rounded-lg">
                    {specialSuggestion.error ? (
                        <p className="text-red-600 font-medium">{specialSuggestion.message}</p>
                    ) : (
                        <>
                            <p className="text-xs font-bold text-purple-700 mb-1 flex items-center gap-1">
                                <Tag className='h-4 w-4' /> AI Suggestion
                            </p>
                            <h4 className="text-xl font-extrabold text-gray-900 mb-1">{specialSuggestion.specialName}</h4>
                            <p className="text-gray-700 text-sm mb-3">{specialSuggestion.description}</p>
                            <p className="italic text-purple-600 text-sm">"{specialSuggestion.tagline}"</p>
                            
                            <button
                                onClick={useSpecialSuggestion}
                                className="mt-4 w-full py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition"
                            >
                                Use Idea in Add Item Form
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
  };
  
  // --- LOGIN VIEW ---
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-red-600 p-8 text-center text-white">
            <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <ChefHat className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold">FreshCanteen</h1>
            <p className="text-orange-100 text-sm mt-1">Please sign in to continue</p>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input 
                    type="text" 
                    required
                    value={loginData.username}
                    onChange={e => setLoginData({...loginData, username: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50"
                    placeholder="Enter username"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input 
                    type="password" 
                    required
                    value={loginData.password}
                    onChange={e => setLoginData({...loginData, password: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50"
                    placeholder="Enter password"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold shadow-lg hover:bg-gray-800 transition-all flex items-center justify-center gap-2 group"
              >
                Sign In <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            {/* Demo Helpers */}
            <div className="mt-8 pt-6 border-t border-dashed border-gray-200">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 text-center">Quick Demo Login</p>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => {
                    setLoginData({ username: 'user', password: 'user' });
                    // setTimeout to allow state update to reflect visually if we wanted, but we can just auto-login
                    setUser({ name: 'Student User', role: 'user' });
                  }}
                  className="py-2 px-3 bg-orange-50 text-orange-700 rounded-lg text-xs font-medium hover:bg-orange-100 transition text-center"
                >
                  Login as User
                </button>
                <button 
                  onClick={() => {
                    setLoginData({ username: 'admin', password: 'admin' });
                    setUser({ name: 'Manager', role: 'admin' });
                    setView('admin');
                  }}
                  className="py-2 px-3 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition text-center"
                >
                  Login as Admin
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN APP ---
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div 
              onClick={() => setView('home')} 
              className="flex items-center cursor-pointer space-x-2"
            >
              <div className="bg-orange-500 p-2 rounded-lg">
                <ChefHat className="h-6 w-6 text-white" />
              </div>
              <span className="hidden md:block text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                FreshCanteen
              </span>
            </div>

            {/* Desktop Nav */}
            <div className="flex items-center space-x-4 md:space-x-6">
              <button 
                onClick={() => setView('home')} 
                className={`text-sm font-medium transition-colors ${view === 'home' ? 'text-orange-600' : 'text-gray-500 hover:text-orange-500'}`}
              >
                Menu
              </button>
              
              {/* Only show Admin Dashboard if role is admin */}
              {user.role === 'admin' && (
                <button 
                  onClick={() => setView('admin')} 
                  className={`flex items-center gap-1 text-sm font-medium transition-colors ${view === 'admin' ? 'text-orange-600' : 'text-gray-500 hover:text-orange-500'}`}
                >
                  <ShieldCheck className="h-4 w-4" /> Admin
                </button>
              )}
              
              {/* Cart Icon */}
              <button 
                onClick={() => setView('cart')}
                className="relative p-2 rounded-full bg-gray-100 hover:bg-orange-50 text-gray-600 hover:text-orange-600 transition-all"
              >
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm">
                    {cartCount}
                  </span>
                )}
              </button>

              <div className="h-6 w-px bg-gray-200"></div>

              {/* User Profile / Logout */}
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-gray-900">{user.name}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide">{user.role}</p>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* VIEW: HOME / MENU */}
        {view === 'home' && (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-orange-500 to-red-600 shadow-lg text-white p-8 md:p-12">
              <div className="relative z-10 max-w-2xl">
                <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
                  Hello, {user.name.split(' ')[0]}! <br/>What are you craving?
                </h1>
                <p className="text-orange-100 text-lg mb-6">
                  Order fresh, hot meals directly from your device. Skip the line, enjoy the time.
                </p>
                <button 
                  onClick={() => document.getElementById('menu-grid').scrollIntoView({ behavior: 'smooth'})}
                  className="bg-white text-orange-600 px-6 py-3 rounded-full font-bold shadow-md hover:bg-gray-100 transition transform hover:-translate-y-1"
                >
                  Order Now
                </button>
              </div>
              {/* Decorative Circle */}
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 right-20 w-40 h-40 bg-yellow-300 opacity-20 rounded-full blur-2xl"></div>
            </div>

            {/* Filters & Search */}
            <div id="menu-grid" className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-20 bg-gray-50 z-30 py-4">
              <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                      activeCategory === cat 
                        ? 'bg-gray-900 text-white shadow-md' 
                        : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input 
                  type="text" 
                  placeholder="Search food..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white shadow-sm"
                />
              </div>
            </div>

            {/* Menu Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredMenu.map(item => (
                <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
                  <div className="h-48 overflow-hidden relative">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-700 uppercase tracking-wide">
                      {item.category}
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-gray-900 leading-tight">{item.name}</h3>
                      <span className="text-lg font-bold text-orange-600">₹{item.price}</span>
                    </div>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">Delicious {item.name.toLowerCase()} prepared fresh daily with premium ingredients.</p>
                    <button 
                      onClick={() => addToCart(item)}
                      className="w-full py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <Plus className="h-4 w-4" /> Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {filteredMenu.length === 0 && (
              <div className="text-center py-20 text-gray-400">
                <UtensilsCrossed className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>No items found. Try a different category.</p>
              </div>
            )}
          </div>
        )}

        {/* VIEW: CART */}
        {view === 'cart' && (
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <ShoppingBag className="text-orange-600" /> Your Cart
            </h2>
            
            {cart.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                <Coffee className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 text-lg">Your cart is empty.</p>
                <button 
                  onClick={() => setView('home')}
                  className="mt-6 px-6 py-2 bg-orange-500 text-white rounded-full font-medium hover:bg-orange-600 transition"
                >
                  Browse Menu
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Cart Items List */}
                <div className="md:col-span-2 space-y-4">
                  {cart.map(item => (
                    <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                      <img src={item.image} alt={item.name} className="w-20 h-20 rounded-xl object-cover" />
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800">{item.name}</h3>
                        <p className="text-orange-600 font-medium">₹{item.price}</p>
                      </div>
                      <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
                        <button 
                          onClick={() => updateQty(item.id, -1)}
                          className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-600 hover:text-red-500"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="font-bold w-4 text-center">{item.qty}</span>
                        <button 
                          onClick={() => updateQty(item.id, 1)}
                          className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-600 hover:text-green-500"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Summary Section */}
                <div className="md:col-span-1">
                  <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 sticky top-24">
                    <h3 className="font-bold text-lg mb-4">Order Summary</h3>
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span>₹{cartTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Tax (5%)</span>
                        <span>₹{(cartTotal * 0.05).toFixed(2)}</span>
                      </div>
                      <div className="border-t pt-3 flex justify-between font-bold text-xl text-gray-900">
                        <span>Total</span>
                        <span>₹{(cartTotal * 1.05).toFixed(2)}</span>
                      </div>
                    </div>
                    <button 
                      onClick={handleCheckout}
                      className="w-full py-4 bg-orange-600 text-white rounded-xl font-bold shadow-lg hover:bg-orange-700 hover:shadow-orange-500/30 transition-all transform active:scale-95"
                    >
                      Checkout Now
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW: ORDER SUCCESS */}
        {view === 'success' && (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <ChefHat className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h2>
            <p className="text-gray-500">Your delicious meal is being prepared.</p>
          </div>
        )}

        {/* VIEW: ADMIN DASHBOARD */}
        {view === 'admin' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <LayoutDashboard className="text-orange-600" /> Admin Dashboard
              </h2>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-500 text-sm font-medium">Total Revenue</h3>
                  <IndianRupee className="text-green-500 h-5 w-5" />
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  ₹{orders.reduce((acc, order) => acc + order.total, 0).toFixed(2)}
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-500 text-sm font-medium">Total Orders</h3>
                  <ListOrdered className="text-blue-500 h-5 w-5" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{orders.length}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-500 text-sm font-medium">Menu Items</h3>
                  <UtensilsCrossed className="text-orange-500 h-5 w-5" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{menu.length}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Chef's Special Generator (LLM Feature) */}
              <ChefSpecialGenerator menuItems={menu} onNewItemGenerated={setNewItem} />
              
              {/* Add New Item Form */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
                <h3 className="font-bold text-lg mb-4 border-b pb-2">Add New Menu Item</h3>
                <form onSubmit={handleAddItem} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                    <input 
                      required
                      type="text" 
                      value={newItem.name}
                      onChange={e => setNewItem({...newItem, name: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                      <input 
                        required
                        type="number" 
                        step="1"
                        value={newItem.price}
                        onChange={e => setNewItem({...newItem, price: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select 
                        value={newItem.category}
                        onChange={e => setNewItem({...newItem, category: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                      >
                        <option>Breakfast</option>
                        <option>Lunch</option>
                        <option>Dinner</option>
                        <option>Beverages</option>
                        <option>Snacks</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                    <input 
                      type="text" 
                      placeholder="https://..."
                      value={newItem.image}
                      onChange={e => setNewItem({...newItem, image: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>
                  <button type="submit" className="w-full py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition">
                    Add Item to Menu
                  </button>
                </form>
              </div>

              {/* Manage Menu List */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
                <h3 className="font-bold text-lg mb-4 border-b pb-2">Manage Current Menu</h3>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {menu.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group">
                      <div className="flex items-center gap-3">
                        <img src={item.image} alt="" className="w-10 h-10 rounded-full object-cover" />
                        <div>
                          <p className="font-bold text-sm text-gray-800">{item.name}</p>
                          <p className="text-xs text-gray-500">₹{item.price} • {item.category}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => deleteItem(item.id)}
                        className="p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-md transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Orders Table */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
               <h3 className="font-bold text-lg mb-4 border-b pb-2">Recent Orders</h3>
               {orders.length === 0 ? (
                 <p className="text-gray-500 text-sm">No orders placed yet.</p>
               ) : (
                 <div className="overflow-x-auto">
                   <table className="w-full text-left">
                     <thead>
                       <tr className="text-gray-400 text-sm border-b">
                         <th className="pb-2 font-medium">Order ID</th>
                         <th className="pb-2 font-medium">Date</th>
                         <th className="pb-2 font-medium">Customer</th>
                         <th className="pb-2 font-medium">Items</th>
                         <th className="pb-2 font-medium">Total</th>
                         <th className="pb-2 font-medium">Status</th>
                       </tr>
                     </thead>
                     <tbody className="text-sm">
                       {orders.map(order => (
                         <tr key={order.id} className="border-b last:border-0">
                           <td className="py-3 text-gray-500">#{order.id.toString().slice(-4)}</td>
                           <td className="py-3 text-gray-800">{order.date}</td>
                           <td className="py-3 text-gray-800 font-medium">{order.user}</td>
                           <td className="py-3 text-gray-600 max-w-xs truncate">
                             {order.items.map(i => `${i.qty}x ${i.name}`).join(', ')}
                           </td>
                           <td className="py-3 font-bold text-gray-900">₹{(order.total * 1.05).toFixed(2)}</td>
                           <td className="py-3">
                             <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-bold">
                               {order.status}
                             </span>
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}