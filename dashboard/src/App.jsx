import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Circle } from '@react-google-maps/api';
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { getFirestore, doc, onSnapshot, setDoc } from "firebase/firestore";
import { 
  Activity, MapPin, AlertTriangle, Anchor, Navigation, 
  Siren, Camera, X, Maximize2, LogOut, ShieldCheck, Mail, Lock, User, AlertCircle,
  Cpu, Gamepad2, Mic, MicOff, Volume2, VolumeX, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Compass
} from 'lucide-react';

const firebaseConfig = {
  apiKey: "AIzaSyDO73DHZmUJ1j4t59DLiWz7ZwQ7DZiJ0To",
  authDomain: "airescuebuoy.firebaseapp.com",
  projectId: "airescuebuoy",
  storageBucket: "airescuebuoy.firebasestorage.app",
  messagingSenderId: "234383151670",
  appId: "1:234383151670:web:acd668fd78259facaf7e97"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

const GOOGLE_MAPS_API_KEY = "AIzaSyBOwSZmSZsMK-gATshLHtAGWhsdDrvo1kE";
const ADMIN_EMAIL = "teacher@logncoding.com";
const CENTER_BASE = { lat: 37.528, lng: 126.934 };

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && currentUser.email === ADMIN_EMAIL) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
  const signup = (email, password) => createUserWithEmailAndPassword(auth, email, password);
  const googleLogin = () => signInWithPopup(auth, googleProvider);
  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, signup, googleLogin, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, signup, googleLogin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isSignUp) {
        await signup(email, password);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-slate-50 font-sans">
      <div className="hidden lg:flex w-1/2 relative bg-slate-900 items-center justify-center overflow-hidden">
        <img 
          src="https://streamline.imgix.net/6066b1e5-92dc-4a76-95d8-ee2d257b10b2/552d20c6-1718-412e-9b73-c3074c48215e/Team%201.jpg?ixlib=rb-1.1.0&w=2000&h=2000&fit=max&or=0&s=5c794ce903c66b7b6ac9faa1af7d3c73.jpg"
          alt="Ocean Rescue" 
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="relative z-10 text-center text-white px-10">
          <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-orange-500/30">
            <Anchor size={40} className="text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-4 tracking-tight">AI Rescue Buoy</h1>
          <p className="text-xl text-slate-200 font-light">
            Human-in-the-loop Autonomous Rescue System
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-slate-900">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </h2>
            <p className="text-slate-500 mt-2">
              {isSignUp ? "Join the rescue network team." : "Sign in to access the control dashboard."}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-center gap-2 rounded-r">
              <AlertCircle size={20} />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-400" size={20} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                  placeholder="name@company.com"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2"
            >
              {isSignUp ? <User size={20} /> : <Anchor size={20} />}
              {isSignUp ? "Sign Up" : "Sign In"}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">Or continue with</span>
              </div>
            </div>

            <button
              onClick={googleLogin}
              className="mt-6 w-full py-3 border border-slate-200 rounded-xl flex items-center justify-center gap-3 hover:bg-slate-50 transition-colors font-medium text-slate-700"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google Sign In
            </button>
          </div>

          <p className="mt-8 text-center text-sm text-slate-600">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="ml-1 font-bold text-orange-600 hover:text-orange-700 hover:underline"
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

const useBuoyData = () => {
  const [data, setData] = useState({
    lat: CENTER_BASE.lat,
    lng: CENTER_BASE.lng,
    speed: 0,
    heading: 0,
    status: 'IDLE',
    personDetected: false,
    connection: 'OFFLINE',
    controlMode: 'AUTO',
    micOn: 0,
    speakerOn: 0,
    manualThrottle: 1000,
    manualSteering: 90
  });

  useEffect(() => {
    const unsubStatus = onSnapshot(doc(db, "buoys", "buoy_01"), (docSnap) => {
      if (docSnap.exists()) {
        const d = docSnap.data();
        setData(prev => ({
          ...prev,
          lat: d.telemetry?.latitude !== undefined ? d.telemetry.latitude : prev.lat,
          lng: d.telemetry?.longitude !== undefined ? d.telemetry.longitude : prev.lng,
          speed: d.telemetry?.speed !== undefined ? d.telemetry.speed : prev.speed,
          heading: d.telemetry?.heading !== undefined ? d.telemetry.heading : prev.heading,
          status: d.status?.current_mode || prev.status,
          personDetected: d.status?.is_person_detected || false,
          connection: 'ONLINE'
        }));
      }
    }, () => console.log("DB Waiting"));

    const unsubControl = onSnapshot(doc(db, "buoys", "buoy_01_control"), (docSnap) => {
        if(docSnap.exists()){
            const c = docSnap.data();
            setData(prev => ({
                ...prev,
                controlMode: c.mode || 'AUTO',
                micOn: c.mic || 0,
                speakerOn: c.speaker || 0,
                manualThrottle: c.throttle || 1000,
                manualSteering: c.steering || 90
            }));
        }
    });

    return () => { unsubStatus(); unsubControl(); };
  }, []);

  return data;
};

const StatusBadge = ({ status }) => {
  const styles = {
    IDLE: "bg-slate-100 text-slate-600",
    SEARCH: "bg-blue-100 text-blue-700",
    TRACKING: "bg-orange-100 text-orange-700 animate-pulse",
    RESCUE: "bg-red-100 text-red-700 font-bold",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${styles[status] || styles.IDLE}`}>
      {status}
    </span>
  );
};

const Dashboard = () => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY
  });

  const buoy = useBuoyData();
  const { user, logout, isAdmin } = useAuth();
  const [map, setMap] = useState(null);
  const [isCamExpanded, setIsCamExpanded] = useState(false);

  const PI_IP = "192.168.0.100";

  const onLoad = useCallback((map) => setMap(map), []);
  const onUnmount = useCallback((map) => setMap(null), []);

  const updateControl = async (updates) => {
    if (!isAdmin) return;
    try {
      await setDoc(doc(db, "buoys", "buoy_01_control"), updates, { merge: true });
    } catch (e) {
      console.error(e);
      alert("제어 명령 전송 실패: " + e.message);
    }
  };

  const handleModeToggle = () => {
    updateControl({ mode: buoy.controlMode === 'AUTO' ? 'MANUAL' : 'AUTO' });
  };

  const handleMicToggle = () => {
    updateControl({ mic: buoy.micOn ? 0 : 1 });
  };

  const handleSpeakerToggle = () => {
    updateControl({ speaker: buoy.speakerOn ? 0 : 1 });
  };

  const handleManualDrive = (direction) => {
      let t = buoy.manualThrottle;
      let s = buoy.manualSteering;

      if(direction === 'up') t = Math.min(2000, t + 100);
      if(direction === 'down') t = Math.max(1000, t - 100);
      if(direction === 'left') s = Math.max(0, s - 15);
      if(direction === 'right') s = Math.min(180, s + 15);
      if(direction === 'stop') { t = 1000; s = 90; }

      updateControl({ throttle: t, steering: s });
  };

  const camImageSrc = `http://${PI_IP}:5000/video_feed`;
  const mapLat = buoy.lat === 0 ? CENTER_BASE.lat : buoy.lat;
  const mapLng = buoy.lng === 0 ? CENTER_BASE.lng : buoy.lng;

  return (
    <div className="relative w-full h-screen bg-slate-50 overflow-hidden font-sans text-slate-800">
      <div className="absolute inset-0 z-0">
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100vh' }}
            center={{ lat: mapLat, lng: mapLng }}
            zoom={16}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={{
              disableDefaultUI: true,
              zoomControl: true,
              styles: [{ featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }]
            }}
          >
            <Marker 
              position={{ lat: mapLat, lng: mapLng }} 
              icon={{
                path: window.google?.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: buoy.personDetected ? "#EF4444" : "#FF5722",
                fillOpacity: 1,
                strokeWeight: 2,
                strokeColor: "#ffffff",
              }}
            />
            <Circle
              center={{ lat: mapLat, lng: mapLng }}
              radius={50}
              options={{
                fillColor: buoy.personDetected ? "#EF4444" : "#FF5722",
                fillOpacity: 0.1,
                strokeWeight: 0,
              }}
            />
          </GoogleMap>
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-slate-200">
            <p className="text-slate-500">Loading Maps...</p>
          </div>
        )}
      </div>

      <header className="absolute top-0 left-0 right-0 z-10 p-6 pointer-events-none">
        <div className="flex justify-between items-start">
          <div className="bg-white/90 backdrop-blur-md shadow-lg rounded-2xl px-6 py-4 pointer-events-auto flex items-center gap-4">
            <div className="w-10 h-10 bg-orange-500/10 rounded-full flex items-center justify-center text-orange-600">
              <Anchor size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-none">AI Rescue Buoy</h1>
              <span className="text-xs text-slate-500 font-medium tracking-wider uppercase">Control Station Alpha</span>
            </div>
            <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>
            
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">{user.email}</span>
                {isAdmin && (
                  <span className="flex items-center gap-1 bg-slate-800 text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                    <ShieldCheck size={10} /> Admin
                  </span>
                )}
              </div>
              <button onClick={logout} className="text-[10px] text-slate-400 hover:text-red-500 flex items-center gap-1 mt-0.5">
                <LogOut size={10} /> Sign Out
              </button>
            </div>
          </div>
          
          {buoy.personDetected && (
            <div className="bg-red-500 text-white shadow-xl shadow-red-500/30 rounded-2xl px-6 py-4 pointer-events-auto animate-bounce">
              <div className="flex items-center gap-3">
                <AlertTriangle size={24} />
                <div>
                  <h2 className="font-bold text-lg leading-none">Emergency Alert</h2>
                  <p className="text-red-100 text-sm mt-1">Person Detected at Sector 4</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="absolute top-32 left-6 z-10 w-80 flex flex-col gap-4 pointer-events-none">
        
        <div className="bg-white/90 backdrop-blur-md shadow-xl rounded-2xl p-5 pointer-events-auto">
          <div className="flex justify-between items-center mb-4">
             <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Control Mode</h3>
             <button 
                onClick={handleModeToggle}
                disabled={!isAdmin}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${!isAdmin ? 'opacity-50 cursor-not-allowed' : ''} ${buoy.controlMode === 'AUTO' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}
             >
                {buoy.controlMode === 'AUTO' ? <Cpu size={16}/> : <Gamepad2 size={16}/>}
                {buoy.controlMode}
             </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
             <button 
                onClick={handleMicToggle}
                disabled={!isAdmin}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${!isAdmin ? 'opacity-50' : ''} ${buoy.micOn ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-slate-200 bg-slate-50 text-slate-400'}`}
             >
                {buoy.micOn ? <Mic size={24}/> : <MicOff size={24}/>}
                <span className="text-xs font-bold mt-1">Mic {buoy.micOn ? 'ON' : 'OFF'}</span>
             </button>
             <button 
                onClick={handleSpeakerToggle}
                disabled={!isAdmin}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${!isAdmin ? 'opacity-50' : ''} ${buoy.speakerOn ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-slate-200 bg-slate-50 text-slate-400'}`}
             >
                {buoy.speakerOn ? <Volume2 size={24}/> : <VolumeX size={24}/>}
                <span className="text-xs font-bold mt-1">Spk {buoy.speakerOn ? 'ON' : 'OFF'}</span>
             </button>
          </div>

          {buoy.controlMode === 'MANUAL' && isAdmin && (
            <div className="bg-slate-100 p-4 rounded-xl flex flex-col items-center gap-2">
                <button onMouseDown={() => handleManualDrive('up')} className="bg-white p-3 rounded-lg shadow hover:bg-slate-50 active:bg-slate-200"><ArrowUp size={20}/></button>
                <div className="flex gap-2">
                   <button onMouseDown={() => handleManualDrive('left')} className="bg-white p-3 rounded-lg shadow hover:bg-slate-50 active:bg-slate-200"><ArrowLeft size={20}/></button>
                   <button onClick={() => handleManualDrive('stop')} className="bg-red-500 text-white p-3 rounded-lg shadow hover:bg-red-600 font-bold text-xs">STOP</button>
                   <button onMouseDown={() => handleManualDrive('right')} className="bg-white p-3 rounded-lg shadow hover:bg-slate-50 active:bg-slate-200"><ArrowRight size={20}/></button>
                </div>
                <button onMouseDown={() => handleManualDrive('down')} className="bg-white p-3 rounded-lg shadow hover:bg-slate-50 active:bg-slate-200"><ArrowDown size={20}/></button>
                <div className="text-[10px] text-slate-400 font-mono mt-2">T:{buoy.manualThrottle} S:{buoy.manualSteering}</div>
            </div>
          )}
        </div>

        <div className="bg-white/90 backdrop-blur-md shadow-xl rounded-2xl p-5 pointer-events-auto hover:scale-[1.02] transition-transform">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Telemetry</h3>
            <StatusBadge status={buoy.status} />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-3 rounded-xl">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Navigation size={14} />
                <span className="text-xs font-medium">Speed</span>
              </div>
              <p className="text-2xl font-bold text-slate-800">{buoy.speed} <span className="text-xs font-normal text-slate-500">kts</span></p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Compass size={14} className="transform transition-transform duration-500" style={{ rotate: `${buoy.heading}deg` }} />
                <span className="text-xs font-medium">Heading</span>
              </div>
              <p className="text-2xl font-bold text-slate-800">
                {buoy.heading.toFixed(0)}<span className="text-xs font-normal text-slate-500">°</span>
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-slate-500">
                <MapPin size={16} />
                <span>GPS Location</span>
              </div>
              <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-xs">
                {mapLat.toFixed(4)}, {mapLng.toFixed(4)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 right-6 z-10 w-96 pointer-events-auto">
        <div 
          className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-slate-100 hover:scale-105 transition-transform cursor-pointer"
          onClick={() => setIsCamExpanded(true)}
        >
          <div className="bg-slate-900 h-56 relative flex items-center justify-center group">
            <img 
              src={camImageSrc}
              alt="Live Feed"
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
              onError={(e) => {e.target.src = "https://images.unsplash.com/photo-1559827291-72ee739d0d9a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80";}}
            />
            
            <div className="absolute top-3 left-3 bg-black/50 backdrop-blur px-2 py-1 rounded text-[10px] text-white font-mono flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
              LIVE CAM 01
            </div>

            <div className="absolute top-3 right-3 bg-black/50 backdrop-blur p-1 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <Maximize2 size={14} />
            </div>
            
            {buoy.personDetected && (
              <div className="absolute inset-0 border-4 border-red-500 animate-pulse pointer-events-none"></div>
            )}
            
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
               <div className="bg-white/20 backdrop-blur rounded-full p-3 text-white">
                 <Camera size={24} />
               </div>
            </div>
          </div>
          
          <div className="p-4 bg-white">
            <h4 className="text-sm font-bold text-slate-800 mb-1">Optical Sensor Feed</h4>
            <p className="text-xs text-slate-500">
              {buoy.personDetected 
                ? "Object detected. Analyzing..." 
                : "Monitoring sector A-4. Status normal."}
            </p>
          </div>
        </div>
      </div>

      {isCamExpanded && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 sm:p-10 animate-fade-in">
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            
            <button 
              onClick={() => setIsCamExpanded(false)}
              className="absolute top-0 right-0 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all z-50"
            >
              <X size={32} />
            </button>

            <div className="relative w-full max-w-6xl max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl bg-black">
              <img 
                src={camImageSrc}
                alt="Live Feed Expanded"
                className="w-full h-full object-contain"
                onError={(e) => {e.target.src = "https://images.unsplash.com/photo-1559827291-72ee739d0d9a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80";}}
              />
              
              <div className="absolute top-6 left-6 bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg text-sm text-white font-mono flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                LIVE FEED • CAM 01
              </div>

              {buoy.personDetected && (
                 <div className="absolute inset-0 border-8 border-red-500/50 pointer-events-none animate-pulse"></div>
              )}
            </div>

            <div className="mt-6 flex items-center gap-6">
              <div className="text-white/80 text-center">
                 <p className="text-xs uppercase tracking-widest text-white/50 mb-1">Status</p>
                 <p className="font-bold">{buoy.personDetected ? "DETECTED" : "SCANNING"}</p>
              </div>
              <div className="h-8 w-[1px] bg-white/20"></div>
              <div className="text-white/80 text-center">
                 <p className="text-xs uppercase tracking-widest text-white/50 mb-1">Latency</p>
                 <p className="font-bold font-mono">24ms</p>
              </div>
              <div className="h-8 w-[1px] bg-white/20"></div>
              <button 
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold transition-colors flex items-center gap-2"
                onClick={() => setIsCamExpanded(false)}
              >
                <AlertTriangle size={18} />
                CONFIRM & CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <MainScreen />
    </AuthProvider>
  );
};

const MainScreen = () => {
  const { user } = useAuth();
  return user ? <Dashboard /> : <Login />;
};

export default App;