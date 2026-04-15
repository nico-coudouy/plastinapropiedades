import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, MapPin, Bed, Bath, Maximize, Phone, Plus, Edit2, Trash2, 
  LogOut, ChevronLeft, ChevronRight, X, Check, Star, LayoutDashboard, 
  Building2, Home, Store, LandPlot, Car, Filter, Menu, Instagram, Facebook 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from './lib/supabase';
import type { Session } from '@supabase/supabase-js';

// --- Types ---

type OperationType = 'Venta' | 'Alquiler';
type PropertyType = 'Casa' | 'Departamento' | 'PH' | 'Local' | 'Terreno' | 'Cochera';
type PropertyStatus = 'Disponible' | 'Reservado' | 'Vendido' | 'Alquilado';
type Currency = 'ARS' | 'USD';
type Orientation = 'N' | 'S' | 'E' | 'O';

interface Property {
  id: string;
  title: string;
  description: string;
  operation: OperationType;
  type: PropertyType;
  price: number;
  currency: Currency;
  address: string;
  neighborhood: string;
  covered_area: number;
  total_area: number;
  rooms: number;
  bedrooms: number;
  bathrooms: number;
  garages: number;
  floor?: string;
  orientation?: Orientation;
  age?: number;
  extras: string[];
  photos: string[];
  status: PropertyStatus;
  is_featured: boolean;
  created_at: string;
}

// --- Constants ---

const EXTRAS_OPTIONS = [
  'Pileta', 'Parrilla', 'Jardín', 'Balcón', 'Terraza', 'Seguridad 24hs', 'Apto crédito', 'Apto profesional'
];

const NEIGHBORHOODS = [
  'Plaza Mitre', 'Los Troncos', 'Chauvín', 'La Perla', 'Playa Grande', 'Güemes', 'Constitución', 'Punta Mogotes', 'Sierra de los Padres'
];

// --- Components ---

interface PropertyCardProps {
  property: Property;
  onClick: () => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onClick }) => {
  const [currentPhoto, setCurrentPhoto] = useState(0);

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentPhoto((prev) => (prev + 1) % property.photos.length);
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentPhoto((prev) => (prev - 1 + property.photos.length) % property.photos.length);
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-white rounded-xl overflow-hidden property-card-shadow border border-gray-100 group cursor-pointer"
      onClick={onClick}
    >
      <div className="relative h-64 overflow-hidden">
        <img 
          src={property.photos[currentPhoto] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800'} 
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {property.is_featured && (
            <span className="bg-gold text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded shadow-sm">
              Destacado
            </span>
          )}
          <span className="bg-navy text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded shadow-sm">
            {property.operation}
          </span>
        </div>

        {property.status !== 'Disponible' && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-white text-navy font-bold uppercase tracking-widest px-4 py-2 rounded-lg transform -rotate-12 border-2 border-navy">
              {property.status}
            </span>
          </div>
        )}

        {property.photos.length > 1 && (
          <>
            <button 
              onClick={prevPhoto}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft size={18} className="text-navy" />
            </button>
            <button 
              onClick={nextPhoto}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight size={18} className="text-navy" />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {property.photos.map((_, i) => (
                <div 
                  key={i} 
                  className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentPhoto ? 'bg-white w-4' : 'bg-white/50'}`} 
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-2xl font-bold text-navy">
            {property.currency} {property.price.toLocaleString('es-AR')}
          </h3>
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
            {property.type}
          </span>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-1 flex items-center gap-1">
          <MapPin size={14} className="text-gold flex-shrink-0" />
          {property.address}, {property.neighborhood}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-gray-50 text-gray-500 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <Bed size={16} className="text-navy/70" />
            <span>{property.bedrooms} Dorm.</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bath size={16} className="text-navy/70" />
            <span>{property.bathrooms} Baños</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Maximize size={16} className="text-navy/70" />
            <span>{property.covered_area} m²</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

interface PropertyModalProps {
  property: Property;
  onClose: () => void;
}

const PropertyModal = ({ property, onClose }: PropertyModalProps) => {
  const [activePhoto, setActivePhoto] = useState(0);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  const whatsappLink = `https://wa.me/+5492234371111?text=Hola! Estoy interesado en la propiedad: ${property.title} (${property.id})`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-navy/90 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
        >
          <X size={24} className="text-navy" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="p-6 lg:p-8 space-y-4">
            <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100">
              <img 
                src={property.photos[activePhoto]} 
                alt={property.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {property.photos.map((photo, i) => (
                <button 
                  key={i}
                  onClick={() => setActivePhoto(i)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${i === activePhoto ? 'border-gold scale-95' : 'border-transparent opacity-70 hover:opacity-100'}`}
                >
                  <img src={photo} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 lg:p-8 lg:border-l border-gray-100">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="bg-navy text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                {property.operation}
              </span>
              <span className="bg-gold text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                {property.type}
              </span>
              {property.is_featured && (
                <span className="bg-gray-100 text-navy text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1">
                  <Star size={10} fill="currentColor" /> Destacado
                </span>
              )}
            </div>

            <h2 className="text-3xl font-serif font-bold text-navy mb-2">{property.title}</h2>
            <p className="text-gray-500 flex items-center gap-1 mb-6">
              <MapPin size={16} className="text-gold" />
              {property.address}, {property.neighborhood}, Mar del Plata
            </p>

            <div className="text-4xl font-bold text-navy mb-8">
              {property.currency} {property.price.toLocaleString('es-AR')}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-50 p-3 rounded-xl text-center">
                <div className="text-navy font-bold text-lg">{property.rooms}</div>
                <div className="text-gray-400 text-[10px] uppercase font-bold">Ambientes</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl text-center">
                <div className="text-navy font-bold text-lg">{property.bedrooms}</div>
                <div className="text-gray-400 text-[10px] uppercase font-bold">Dorm.</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl text-center">
                <div className="text-navy font-bold text-lg">{property.bathrooms}</div>
                <div className="text-gray-400 text-[10px] uppercase font-bold">Baños</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl text-center">
                <div className="text-navy font-bold text-lg">{property.covered_area}</div>
                <div className="text-gray-400 text-[10px] uppercase font-bold">m² Cub.</div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-navy font-bold uppercase text-xs tracking-widest mb-3 border-b border-gray-100 pb-2">Descripción</h4>
                <p className="text-gray-600 leading-relaxed text-sm">{property.description}</p>
              </div>

              <div>
                <h4 className="text-navy font-bold uppercase text-xs tracking-widest mb-3 border-b border-gray-100 pb-2">Características</h4>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <div className="flex justify-between pr-4"><span className="text-gray-400">Sup. Total:</span> <span className="font-medium">{property.total_area} m²</span></div>
                  <div className="flex justify-between pr-4"><span className="text-gray-400">Cocheras:</span> <span className="font-medium">{property.garages}</span></div>
                  {property.floor && <div className="flex justify-between pr-4"><span className="text-gray-400">Piso:</span> <span className="font-medium">{property.floor}</span></div>}
                  {property.orientation && <div className="flex justify-between pr-4"><span className="text-gray-400">Orientación:</span> <span className="font-medium">{property.orientation}</span></div>}
                  {property.age !== undefined && <div className="flex justify-between pr-4"><span className="text-gray-400">Antigüedad:</span> <span className="font-medium">{property.age} años</span></div>}
                </div>
              </div>

              {property.extras.length > 0 && (
                <div>
                  <h4 className="text-navy font-bold uppercase text-xs tracking-widest mb-3 border-b border-gray-100 pb-2">Extras</h4>
                  <div className="flex flex-wrap gap-2">
                    {property.extras.map(extra => (
                      <span key={extra} className="bg-gold/10 text-gold text-[10px] font-bold px-2 py-1 rounded border border-gold/20">
                        {extra}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-6">
                <a 
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <Phone size={20} fill="currentColor" />
                  Consultar por WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// --- Main App Component ---

export default function App() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [password, setPassword] = useState('');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  
  // Filters
  const [filterOperation, setFilterOperation] = useState<string>('Todos');
  const [filterType, setFilterType] = useState<string>('Todos');
  const [filterNeighborhood, setFilterNeighborhood] = useState<string>('Todos');
  const [filterPriceRange, setFilterPriceRange] = useState<[number, number]>([0, 1000000]);
  const [filterBedrooms, setFilterBedrooms] = useState<string>('Todos');

  // Admin State
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Auth Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Load Data
  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) console.error('Error cargando propiedades:', error);
    else setProperties(data || []);
    setLoading(false);
  };

  const hasActiveFilters = 
    filterOperation !== 'Todos' || 
    filterType !== 'Todos' || 
    filterNeighborhood !== 'Todos' || 
    filterBedrooms !== 'Todos';

  const clearFilters = () => {
    setFilterOperation('Todos');
    setFilterType('Todos');
    setFilterNeighborhood('Todos');
    setFilterBedrooms('Todos');
  };

  const filteredProperties = useMemo(() => {
    return properties.filter(p => {
      const opMatch = filterOperation === 'Todos' || p.operation === filterOperation;
      const typeMatch = filterType === 'Todos' || p.type === filterType;
      const neighborhoodMatch = filterNeighborhood === 'Todos' || p.neighborhood === filterNeighborhood;
      const priceMatch = p.price >= filterPriceRange[0] && p.price <= filterPriceRange[1];
      const bedMatch = filterBedrooms === 'Todos' || 
                      (filterBedrooms === '4+' ? p.bedrooms >= 4 : p.bedrooms === parseInt(filterBedrooms));
      return opMatch && typeMatch && neighborhoodMatch && priceMatch && bedMatch;
    });
  }, [properties, filterOperation, filterType, filterNeighborhood, filterPriceRange, filterBedrooms]);

  // Auth Handlers
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({
      email: 'admin@plastina.com.ar',
      password
    });
    if (error) alert('Credenciales incorrectas: ' + error.message);
    else {
      setPassword('');
      setShowAdminPanel(false); // Volver a vista pública tras login exitoso
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowAdminPanel(false);
  };

  // CRUD Handlers
  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que querés borrar esta propiedad?')) return;
    const { error } = await supabase.from('properties').delete().eq('id', id);
    if (error) alert('Error al eliminar: ' + error.message);
    else setProperties(prev => prev.filter(p => p.id !== id));
  };

  const handleSaveProperty = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const payload = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      operation: formData.get('operation') as OperationType,
      type: formData.get('type') as PropertyType,
      price: Number(formData.get('price')),
      currency: formData.get('currency') as Currency,
      address: formData.get('address') as string,
      neighborhood: formData.get('neighborhood') as string,
      covered_area: Number(formData.get('coveredArea')),
      total_area: Number(formData.get('totalArea')),
      rooms: Number(formData.get('rooms')),
      bedrooms: Number(formData.get('bedrooms')),
      bathrooms: Number(formData.get('bathrooms')),
      garages: Number(formData.get('garages')),
      floor: (formData.get('floor') as string) || null,
      orientation: (formData.get('orientation') as Orientation) || null,
      age: Number(formData.get('age')) || null,
      extras: EXTRAS_OPTIONS.filter(opt => formData.get(`extra-${opt}`) === 'on'),
      photos: (formData.get('photos') as string).split('\n').filter(u => u.trim()),
      status: formData.get('status') as PropertyStatus,
      is_featured: formData.get('isFeatured') === 'on',
    };

    let error;
    if (editingProperty) {
      ({ error } = await supabase.from('properties').update(payload).eq('id', editingProperty.id));
    } else {
      ({ error } = await supabase.from('properties').insert(payload));
    }

    if (error) {
      alert('Error al guardar: ' + error.message);
    } else {
      setShowForm(false);
      setEditingProperty(null);
      loadProperties();
    }
  };

  const toggleFeatured = async (id: string) => {
    const prop = properties.find(p => p.id === id);
    if (!prop) return;
    const newVal = !prop.is_featured;
    await supabase.from('properties').update({ is_featured: newVal }).eq('id', id);
    setProperties(prev => prev.map(p => p.id === id ? { ...p, is_featured: newVal } : p));
  };

  const updateStatus = async (id: string, status: PropertyStatus) => {
    await supabase.from('properties').update({ status }).eq('id', id);
    setProperties(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  };

  // --- Views ---

  if (!session && showAdminPanel) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="text-gold" size={32} />
            </div>
            <h1 className="text-2xl font-serif font-bold text-navy">Panel de Control</h1>
            <p className="text-gray-400 text-sm">Ingresá tu contraseña para continuar</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[#7B4FA6] mb-2">Contraseña</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#E8E0F0] focus:ring-2 focus:ring-[#7B4FA6] focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-[#4A2B6B] hover:bg-[#2E1848] text-white font-bold py-3 rounded-xl transition-all shadow-lg"
            >
              Entrar
            </button>
            <button 
              type="button"
              onClick={() => setShowAdminPanel(false)}
              className="w-full text-[#B896D4] text-sm hover:text-[#4A2B6B] transition-colors"
            >
              Volver al sitio público
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  if (session) {
    const stats = {
      total: properties.length,
      venta: properties.filter(p => p.operation === 'Venta').length,
      alquiler: properties.filter(p => p.operation === 'Alquiler').length
    };

    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-[#E8E0F0] sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="text-[#7B4FA6]" size={28} />
              <h1 className="text-xl font-serif font-bold text-[#4A2B6B] hidden sm:block">Plastina Admin</h1>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => { setEditingProperty(null); setShowForm(true); }}
                className="bg-[#4A2B6B] hover:bg-[#2E1848] text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-all shadow-md"
              >
                <Plus size={18} /> <span className="hidden sm:inline">Nueva Propiedad</span>
              </button>
              <button 
                onClick={handleLogout}
                className="bg-[#7B4FA6] hover:bg-[#4A2B6B] text-white px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-md hidden sm:block"
                title="Cerrar Sesión"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-navy/5 rounded-xl flex items-center justify-center text-navy">
                <LayoutDashboard size={24} />
              </div>
              <div>
                <div className="text-2xl font-bold text-navy">{stats.total}</div>
                <div className="text-xs text-gray-400 uppercase font-bold tracking-wider">Total Propiedades</div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                <Home size={24} />
              </div>
              <div>
                <div className="text-2xl font-bold text-navy">{stats.venta}</div>
                <div className="text-xs text-gray-400 uppercase font-bold tracking-wider">En Venta</div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                <Store size={24} />
              </div>
              <div>
                <div className="text-2xl font-bold text-navy">{stats.alquiler}</div>
                <div className="text-xs text-gray-400 uppercase font-bold tracking-wider">En Alquiler</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Propiedad</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Precio</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Estado</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400 text-center">Destacado</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {properties.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <img src={p.photos[0]} alt="" className="w-12 h-12 rounded-lg object-cover" referrerPolicy="no-referrer" />
                          <div>
                            <div className="font-bold text-navy text-sm">{p.title}</div>
                            <div className="text-xs text-gray-400">{p.neighborhood} • {p.type}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-navy text-sm">{p.currency} {p.price.toLocaleString('es-AR')}</div>
                        <div className="text-[10px] text-gold font-bold uppercase">{p.operation}</div>
                      </td>
                      <td className="px-6 py-4">
                        <select 
                          value={p.status}
                          onChange={(e) => updateStatus(p.id, e.target.value as PropertyStatus)}
                          className="text-xs font-bold bg-gray-100 border-none rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-gold"
                        >
                          <option value="Disponible">Disponible</option>
                          <option value="Reservado">Reservado</option>
                          <option value="Vendido">Vendido</option>
                          <option value="Alquilado">Alquilado</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => toggleFeatured(p.id)}
                          className={`p-2 rounded-full transition-colors ${p.is_featured ? 'text-gold bg-gold/10' : 'text-gray-300 hover:text-gold'}`}
                        >
                          <Star size={20} fill={p.is_featured ? 'currentColor' : 'none'} />
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => { setEditingProperty(p); setShowForm(true); }}
                            className="p-2 text-gray-400 hover:text-navy transition-colors"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(p.id)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        <AnimatePresence>
          {showForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowForm(false)}
                className="absolute inset-0 bg-navy/80 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-6 sm:p-8"
              >
                <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
                  <h2 className="text-2xl font-serif font-bold text-[#4A2B6B]">
                    {editingProperty ? 'Editar Propiedad' : 'Nueva Propiedad'}
                  </h2>
                  <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-[#4A2B6B]">
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSaveProperty} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-gold border-b border-gold/20 pb-1">Información Básica</h3>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Título</label>
                        <input name="title" defaultValue={editingProperty?.title} className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-gold" required />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Descripción</label>
                        <textarea name="description" defaultValue={editingProperty?.description} className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-gold h-32" required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Operación</label>
                          <select name="operation" defaultValue={editingProperty?.operation || 'Venta'} className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-gold">
                            <option value="Venta">Venta</option>
                            <option value="Alquiler">Alquiler</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Tipo</label>
                          <select name="type" defaultValue={editingProperty?.type || 'Departamento'} className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-gold">
                            <option value="Casa">Casa</option>
                            <option value="Departamento">Departamento</option>
                            <option value="PH">PH</option>
                            <option value="Local">Local</option>
                            <option value="Terreno">Terreno</option>
                            <option value="Cochera">Cochera</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Precio</label>
                          <input type="number" name="price" defaultValue={editingProperty?.price} className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-gold" required />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Moneda</label>
                          <select name="currency" defaultValue={editingProperty?.currency || 'USD'} className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-gold">
                            <option value="USD">USD</option>
                            <option value="ARS">ARS</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-gold border-b border-gold/20 pb-1">Ubicación y Medidas</h3>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Dirección</label>
                        <input name="address" defaultValue={editingProperty?.address} className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-gold" required />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Barrio</label>
                        <select name="neighborhood" defaultValue={editingProperty?.neighborhood || 'Plaza Mitre'} className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-gold">
                          {NEIGHBORHOODS.map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Sup. Cubierta (m²)</label>
                          <input type="number" name="coveredArea" defaultValue={editingProperty?.covered_area} className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-gold" required />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Sup. Total (m²)</label>
                          <input type="number" name="totalArea" defaultValue={editingProperty?.total_area} className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-gold" required />
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Amb.</label>
                          <input type="number" name="rooms" defaultValue={editingProperty?.rooms} className="w-full px-2 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-gold text-center" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Dorm.</label>
                          <input type="number" name="bedrooms" defaultValue={editingProperty?.bedrooms} className="w-full px-2 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-gold text-center" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Baños</label>
                          <input type="number" name="bathrooms" defaultValue={editingProperty?.bathrooms} className="w-full px-2 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-gold text-center" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Coch.</label>
                          <input type="number" name="garages" defaultValue={editingProperty?.garages} className="w-full px-2 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-gold text-center" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-gold border-b border-gold/20 pb-1">Extras y Estado</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {EXTRAS_OPTIONS.map(opt => (
                          <label key={opt} className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                            <input type="checkbox" name={`extra-${opt}`} defaultChecked={editingProperty?.extras.includes(opt)} className="rounded text-gold focus:ring-gold" />
                            {opt}
                          </label>
                        ))}
                      </div>
                      <div className="pt-4 space-y-4">
                        <label className="flex items-center gap-2 text-sm font-bold text-navy cursor-pointer">
                          <input type="checkbox" name="isFeatured" defaultChecked={editingProperty?.is_featured} className="w-5 h-5 rounded text-gold focus:ring-gold" />
                          Marcar como Destacado
                        </label>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Estado Actual</label>
                          <select name="status" defaultValue={editingProperty?.status || 'Disponible'} className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-gold">
                            <option value="Disponible">Disponible</option>
                            <option value="Reservado">Reservado</option>
                            <option value="Vendido">Vendido</option>
                            <option value="Alquilado">Alquilado</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-gold border-b border-gold/20 pb-1">Fotos (URLs)</h3>
                      <p className="text-[10px] text-gray-400">Pegá una URL por línea. La primera será la portada.</p>
                      <textarea 
                        name="photos" 
                        defaultValue={editingProperty?.photos.join('\n')} 
                        placeholder="https://ejemplo.com/foto1.jpg&#10;https://ejemplo.com/foto2.jpg"
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-gold h-48 font-mono text-xs" 
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-6 border-t border-[#E8E0F0]">
                    <button 
                      type="submit"
                      className="flex-1 bg-[#4A2B6B] hover:bg-[#2E1848] text-white font-bold py-4 rounded-xl transition-all shadow-lg"
                    >
                      {editingProperty ? 'Guardar Cambios' : 'Crear Propiedad'}
                    </button>
                    <button 
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-8 bg-[#F5F2F8] hover:bg-[#E8E0F0] text-[#4A2B6B] font-bold py-4 rounded-xl transition-all"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // --- Public View ---
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-24 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-navy rounded-xl flex items-center justify-center text-gold shadow-lg">
              <Building2 size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold text-navy leading-none">Plastina</h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Propiedades</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-navy">
            <a href="#" className="hover:text-gold transition-colors">Inicio</a>
            <a href="#" className="hover:text-gold transition-colors">Venta</a>
            <a href="#" className="hover:text-gold transition-colors">Alquiler</a>
            <a href="#" className="hover:text-gold transition-colors">Contacto</a>
          </nav>

          <div className="flex items-center gap-4">
            <a 
              href="https://wa.me/+5492234371111" 
              className="bg-[#4A2B6B] hover:bg-[#2E1848] text-white px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-md hidden sm:block"
            >
              Contactanos
            </a>
          </div>
        </div>
      </header>

      <section className="relative py-12 bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl -mt-20 relative z-10 border border-gray-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1">
                  <Filter size={10} /> Operación
                </label>
                <select 
                  value={filterOperation}
                  onChange={(e) => setFilterOperation(e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-medium text-navy outline-none focus:ring-2 focus:ring-gold"
                >
                  <option value="Todos">Todas</option>
                  <option value="Venta">Venta</option>
                  <option value="Alquiler">Alquiler</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1">
                  <Building2 size={10} /> Tipo
                </label>
                <select 
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-medium text-navy outline-none focus:ring-2 focus:ring-gold"
                >
                  <option value="Todos">Todos</option>
                  <option value="Casa">Casa</option>
                  <option value="Departamento">Departamento</option>
                  <option value="PH">PH</option>
                  <option value="Local">Local</option>
                  <option value="Terreno">Terreno</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1">
                  <MapPin size={10} /> Zona
                </label>
                <select 
                  value={filterNeighborhood}
                  onChange={(e) => setFilterNeighborhood(e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-medium text-navy outline-none focus:ring-2 focus:ring-gold"
                >
                  <option value="Todos">Todas las zonas</option>
                  {NEIGHBORHOODS.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1">
                  <Bed size={10} /> Dormitorios
                </label>
                <select 
                  value={filterBedrooms}
                  onChange={(e) => setFilterBedrooms(e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-medium text-navy outline-none focus:ring-2 focus:ring-gold"
                >
                  <option value="Todos">Cualquiera</option>
                  <option value="1">1 Dormitorio</option>
                  <option value="2">2 Dormitorios</option>
                  <option value="3">3 Dormitorios</option>
                  <option value="4+">4+ Dormitorios</option>
                </select>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                <span>
                  <span className="font-bold text-navy">{filteredProperties.length}</span>
                  {' '}propiedad{filteredProperties.length !== 1 ? 'es' : ''} encontrada{filteredProperties.length !== 1 ? 's' : ''}
                </span>
              </div>

              <AnimatePresence>
                {hasActiveFilters && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9, x: 10 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9, x: 10 }}
                    transition={{ duration: 0.15 }}
                    onClick={clearFilters}
                    className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-red-500 transition-colors border border-gray-200 hover:border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-lg"
                  >
                    <X size={13} /> Limpiar filtros
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h2 className="text-4xl sm:text-5xl font-serif font-bold text-navy mb-4">Propiedades Disponibles</h2>
            <p className="text-gray-400 max-w-xl">
              Explorá nuestra selección exclusiva de propiedades en Mar del Plata. Encontrá el hogar que siempre soñaste con Plastina Propiedades.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-gray-400">Cargando propiedades...</p>
          </div>
        ) : filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            <AnimatePresence mode="popLayout">
              {filteredProperties.map(p => (
                <PropertyCard 
                  key={p.id} 
                  property={p} 
                  onClick={() => setSelectedProperty(p)} 
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <Search size={32} className="text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-navy mb-2">No encontramos resultados</h3>
            <p className="text-gray-400">Probá cambiando los filtros de búsqueda, che.</p>
            <button 
              onClick={clearFilters}
              className="mt-6 text-gold font-bold uppercase tracking-widest text-xs hover:underline"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </main>

      <footer className="bg-navy text-white pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-navy shadow-lg">
                  <Building2 size={28} />
                </div>
                <div>
                  <h1 className="text-2xl font-serif font-bold text-white leading-none">Plastina</h1>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Propiedades</p>
                </div>
              </div>
              <p className="text-gray-400 max-w-sm leading-relaxed mb-8">
                Somos una empresa familiar con más de 20 años de trayectoria en el mercado inmobiliario de Mar del Plata. Brindamos asesoramiento integral y personalizado.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-gold transition-colors">
                  <Instagram size={20} />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-gold transition-colors">
                  <Facebook size={20} />
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-gold font-bold uppercase text-xs tracking-widest mb-6">Navegación</h4>
              <ul className="space-y-4 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Propiedades en Venta</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Alquileres Temporarios</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tasaciones</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Sobre Nosotros</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-gold font-bold uppercase text-xs tracking-widest mb-6">Contacto</h4>
              <ul className="space-y-4 text-sm text-gray-400">
                <li className="flex items-center gap-3">
                  <MapPin size={16} className="text-gold" />
                  Falucho 2300, Mar del Plata
                </li>
                <li className="flex items-center gap-3">
                  <Phone size={16} className="text-gold" />
                  +54 9 2234371111
                </li>
                <li className="flex items-center gap-3">
                  <X size={16} className="text-gold" />
                  info@plastina.com.ar
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/5 pt-10 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">
            <p>© 2026 Plastina Propiedades. Todos los derechos reservados.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-white transition-colors">Términos y Condiciones</a>
              <a href="#" className="hover:text-white transition-colors">Privacidad</a>
              
              <button
                onClick={() => setShowAdminPanel(true)}
                className="flex flex-col gap-[3px] opacity-20 hover:opacity-50 transition-opacity duration-300 p-1 group"
                title=""
                aria-label=""
              >
                <span className="block w-3.5 h-px bg-gray-400 transition-all duration-300 group-hover:w-3.5" />
                <span className="block w-2.5 h-px bg-gray-400 transition-all duration-300 group-hover:w-3.5" />
                <span className="block w-1.5 h-px bg-gray-400 transition-all duration-300 group-hover:w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {selectedProperty && (
          <PropertyModal 
            property={selectedProperty} 
            onClose={() => setSelectedProperty(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}