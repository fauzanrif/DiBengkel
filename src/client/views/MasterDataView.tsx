import React, { useState, useEffect, useMemo } from 'react';
import { 
  Database, 
  Package, 
  Building2, 
  Users, 
  Car, 
  MapPin, 
  Wrench,
  Search,
  Plus,
  Filter,
  MoreVertical,
  Download,
  Terminal,
  Grid,
  List as ListIcon,
  ChevronRight,
  Edit,
  Trash2,
  X,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const MasterDataView: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState('sparepart');
  const [records, setRecords] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]); // To link owner inside vehicle records
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals & form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isCreatingNewCustomerInVehicleForm, setIsCreatingNewCustomerInVehicleForm] = useState(false);

  // Sparepart filters states
  const [filterCategory, setFilterCategory] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterActive, setFilterActive] = useState('');
  const [filterConsignment, setFilterConsignment] = useState('');

  // Customer filters states
  const [custFilterBpCategory, setCustFilterBpCategory] = useState('');
  const [custFilterBpType, setCustFilterBpType] = useState('');
  const [custFilterPaymentTerms, setCustFilterPaymentTerms] = useState('');
  const [custFilterActive, setCustFilterActive] = useState('');

  // Record counters
  const [counts, setCounts] = useState<Record<string, number>>({
    sparepart: 0,
    supplier: 0,
    customer: 0,
    vehicle: 0,
    branch: 0,
    service: 0,
  });

  const menuItems = [
    { id: 'sparepart', name: 'Sparepart Master', icon: Package, key: 'sparepart' },
    { id: 'supplier', name: 'Supplier Master', icon: Building2, key: 'supplier' },
    { id: 'customer', name: 'Customer Master', icon: Users, key: 'customer' },
    { id: 'vehicle', name: 'Vehicle Master', icon: Car, key: 'vehicle' },
    { id: 'branch', name: 'Branch Master', icon: MapPin, key: 'branch' },
    { id: 'service', name: 'Service Type Master', icon: Wrench, key: 'service' },
  ];

  // Fetch count of all modules and list records for specified active module
  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [spRes, supRes, custRes, vehRes, brRes, srvRes] = await Promise.all([
        fetch('/api/master/spare-parts'),
        fetch('/api/master/suppliers'),
        fetch('/api/master/customers'),
        fetch('/api/master/vehicles'),
        fetch('/api/master/workshops'),
        fetch('/api/master/tasks')
      ]);

      const sp = spRes.ok ? await spRes.json() : [];
      const sup = supRes.ok ? await supRes.json() : [];
      const cust = custRes.ok ? await custRes.json() : [];
      const veh = vehRes.ok ? await vehRes.json() : [];
      const br = brRes.ok ? await brRes.json() : [];
      const srv = srvRes.ok ? await srvRes.json() : [];

      setCounts({
        sparepart: sp.length,
        supplier: sup.length,
        customer: cust.length,
        vehicle: veh.length,
        branch: br.length,
        service: srv.length,
      });

      setCustomers(cust);
      setVehicles(veh);

      // Map module name to loaded item arrays
      if (activeMenu === 'sparepart') setRecords(sp);
      else if (activeMenu === 'supplier') setRecords(sup);
      else if (activeMenu === 'customer') setRecords(cust);
      else if (activeMenu === 'vehicle') setRecords(veh);
      else if (activeMenu === 'branch') setRecords(br);
      else if (activeMenu === 'service') setRecords(srv);

    } catch (err) {
      console.error('Error fetching system master data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, [activeMenu]);

  // Open modal for Creating or Editing Record
  const openModal = (record: any = null) => {
    setSelectedRecord(record);
    setErrorMessage('');
    setIsCreatingNewCustomerInVehicleForm(false);
    if (record) {
      // Edit Mode
      setFormData({ ...record });
    } else {
      // Create Mode: set tailored initial defaults
      const defaults: Record<string, any> = {};
      if (activeMenu === 'sparepart') {
        const randomCode = `SPP-${Math.floor(1000 + Math.random() * 9000)}`;
        defaults.code = randomCode;
        defaults.partCode = randomCode;
        defaults.name = '';
        defaults.unit = 'pcs';
        defaults.uom = 'pcs';
        defaults.category = 'Lubricants';
        defaults.productCategory = 'Lubricants';
        defaults.productType = 'Goods';
        defaults.basePrice = 0;
        defaults.purchasePrice = 0;
        defaults.isConsignment = false;
        defaults.searchKey = '';
        defaults.description = '';
        defaults.flagPurchase = true;
        defaults.flagSale = true;
        defaults.flagStocked = true;
        defaults.flagActive = true;
        defaults.typeSeries = '';
        defaults.brand = '';
        defaults.quality = 'Original';
        defaults.lifetimeKm = 0;
        defaults.lifetimeMonth = 0;
      } else if (activeMenu === 'supplier') {
        defaults.code = `SUP-${Math.floor(1000 + Math.random() * 9000)}`;
        defaults.name = '';
        defaults.contact = '';
        defaults.phone = '';
        defaults.paymentTerm = 'Net 30';
        defaults.type = 'Regular';
        defaults.address = '';
      } else if (activeMenu === 'customer') {
        const randomKey = `CUST-${Math.floor(1000 + Math.random() * 9000)}`;
        defaults.searchKey = randomKey;
        defaults.name = '';
        defaults.commercialName = '';
        defaults.bpCategory = 'Retail';
        defaults.bpType = 'Customer';
        defaults.nationality = 'Indonesia';
        defaults.entityProfile = 'Individual';
        defaults.taxId = '';
        defaults.fiscalName = '';
        defaults.description = '';
        defaults.url = '';
        defaults.referenceNo = '';
        defaults.consumptionDays = 30;
        defaults.isActive = true;
        defaults.summaryLevel = false;

        // Customer Information defaults
        defaults.isCustomer = true;
        defaults.financialAccount = 'Cash Account';
        defaults.priceList = 'Standard Price List';
        defaults.paymentMethod = 'Cash';
        defaults.paymentTerms = 'Immediate';
        defaults.invoiceTerms = 'Immediate';
        defaults.salesRep = '';
        defaults.taxExempt = false;
        defaults.onHold = false;

        // Contact Information
        defaults.email = '';
        defaults.phone = '';

        // Address Information
        defaults.address = '';
      } else if (activeMenu === 'vehicle') {
        defaults.plateNumber = '';
        defaults.model = '';
        defaults.chassisNumber = '';
        defaults.engineNumber = '';
        defaults.customerId = customers[0]?.id || '';
      } else if (activeMenu === 'branch') {
        defaults.name = '';
        defaults.address = '';
        defaults.phone = '';
      } else if (activeMenu === 'service') {
        defaults.name = '';
        defaults.category = 'engine';
        defaults.standardPrice = 0;
      }
      setFormData(defaults);
    }
    setIsModalOpen(true);
  };

  // Submit create or edit form
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    let url = '';
    const method = selectedRecord ? 'PUT' : 'POST';
    
    switch (activeMenu) {
      case 'sparepart': 
        url = selectedRecord ? `/api/master/spare-parts/${selectedRecord.id}` : '/api/master/spare-parts'; 
        break;
      case 'supplier': 
        url = selectedRecord ? `/api/master/suppliers/${selectedRecord.id}` : '/api/master/suppliers'; 
        break;
      case 'customer': 
        url = selectedRecord ? `/api/master/customers/${selectedRecord.id}` : '/api/master/customers'; 
        break;
      case 'vehicle': 
        url = selectedRecord ? `/api/master/vehicles/${selectedRecord.id}` : '/api/master/vehicles'; 
        break;
      case 'branch': 
        url = selectedRecord ? `/api/master/workshops/${selectedRecord.id}` : '/api/master/workshops'; 
        break;
      case 'service': 
        url = selectedRecord ? `/api/master/tasks/${selectedRecord.id}` : '/api/master/tasks'; 
        break;
    }

    // Prepare payload structure and cast properties
    const payload = { ...formData };
    
    if (activeMenu === 'sparepart') {
      payload.basePrice = parseFloat(payload.basePrice) || 0;
      payload.purchasePrice = parseFloat(payload.purchasePrice) || 0;
      payload.isConsignment = !!payload.isConsignment;
      payload.flagPurchase = payload.flagPurchase !== false;
      payload.flagSale = payload.flagSale !== false;
      payload.flagStocked = payload.flagStocked !== false;
      payload.flagActive = payload.flagActive !== false;
      payload.lifetimeKm = parseInt(payload.lifetimeKm) || 0;
      payload.lifetimeMonth = parseInt(payload.lifetimeMonth) || 0;
      // Sync legacy database keys
      payload.code = payload.partCode || payload.code || '';
      payload.unit = payload.uom || payload.unit || 'pcs';
      payload.category = payload.productCategory || payload.category || 'Lubricants';
    } else if (activeMenu === 'customer') {
      payload.consumptionDays = parseInt(payload.consumptionDays) || 30;
      payload.termsDays = parseInt(payload.consumptionDays) || 30;
      payload.isActive = payload.isActive !== false;
      payload.summaryLevel = !!payload.summaryLevel;
      payload.isCustomer = payload.isCustomer !== false;
      payload.taxExempt = !!payload.taxExempt;
      payload.onHold = !!payload.onHold;
      
      // Keep legacy name/type fields synchronized for other screens
      payload.name = payload.commercialName || payload.name || '';
      payload.type = payload.bpCategory === 'Corporate' ? 'corporate' : 'individual';
    } else if (activeMenu === 'service') {
      payload.standardPrice = parseFloat(payload.standardPrice) || 0;
    }

    // Strip entity properties not allowed in body payload
    delete payload.id;
    delete payload.createdAt;
    delete payload.updatedAt;
    delete payload.vehicles;
    delete payload.customer;
    delete payload.newCustName;
    delete payload.newCustPhone;
    delete payload.newCustBpCategory;

    try {
      if (activeMenu === 'vehicle' && isCreatingNewCustomerInVehicleForm) {
        if (!formData.newCustName || !formData.newCustPhone) {
          setErrorMessage('Nama Pelanggan dan No. Telepon wajib diisi!');
          return;
        }

        const custPayload = {
          searchKey: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
          name: formData.newCustName,
          commercialName: formData.newCustName,
          bpCategory: formData.newCustBpCategory || 'Retail',
          bpType: 'Customer',
          phone: formData.newCustPhone,
          isActive: true,
          isCustomer: true,
          paymentTerms: 'Immediate',
          priceList: 'Standard Price List',
          consumptionDays: 30,
          termsDays: 30,
        };

        const custRes = await fetch('/api/master/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(custPayload),
        });

        if (!custRes.ok) {
          const errVal = await custRes.json();
          const msg = Array.isArray(errVal?.message) ? errVal.message.join(', ') : errVal?.message || 'Gagal menyimpan data pelanggan baru';
          setErrorMessage(msg);
          return;
        }

        const savedCustObj = await custRes.json();
        payload.customerId = savedCustObj.id;
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSuccessMessage(selectedRecord ? `Data ${activeMenu} berhasil dperbaharui!` : `Data ${activeMenu} berhasil ditambahkan!`);
        setIsModalOpen(false);
        fetchInitialData();
        setTimeout(() => setSuccessMessage(''), 4000);
      } else {
        const errVal = await res.json();
        const msg = Array.isArray(errVal?.message) ? errVal.message.join(', ') : errVal?.message || 'Gagal menyimpan data';
        setErrorMessage(msg);
      }
    } catch (err) {
      console.error('Master data save exception:', err);
      setErrorMessage('Terjadi kendala jaringan.');
    }
  };

  // Permanently delete master record
  const handleDelete = async (id: string, codeOrName: string) => {
    if (!window.confirm(`Apakah anda yakin ingin menghapus data "${codeOrName}" secara permanen?`)) {
      return;
    }
    
    setErrorMessage('');
    let url = '';
    switch (activeMenu) {
      case 'sparepart': url = `/api/master/spare-parts/${id}`; break;
      case 'supplier': url = `/api/master/suppliers/${id}`; break;
      case 'customer': url = `/api/master/customers/${id}`; break;
      case 'vehicle': url = `/api/master/vehicles/${id}`; break;
      case 'branch': url = `/api/master/workshops/${id}`; break;
      case 'service': url = `/api/master/tasks/${id}`; break;
    }

    try {
      const res = await fetch(url, { method: 'DELETE' });
      if (res.ok) {
        setSuccessMessage(`Data ${activeMenu} berhasil dihapus!`);
        fetchInitialData();
        setTimeout(() => setSuccessMessage(''), 4000);
      } else {
        const errorText = await res.text();
        alert(errorText.includes('foreign key') || errorText.includes('Constraint') 
          ? 'Gagal menghapus! Data ini sudah digunakan pad transaksi aktif lain (SPK, Penjualan, atau Inventory).' 
          : 'Gagal menghapus data master ini.'
        );
      }
    } catch (err) {
      console.error('Master data delete exception:', err);
    }
  };

  // Dynamically compute unique categories from database records
  const uniqueCategories = useMemo(() => {
    const cats = new Set<string>(['Lubricants', 'Brake', 'Engine Parts', 'Electrical', 'Filters', 'Undercarriage']);
    records.forEach(r => {
      const val = r.productCategory || r.category;
      if (val) cats.add(val);
    });
    return Array.from(cats);
  }, [records]);

  // Dynamically compute unique brands from database records
  const uniqueBrands = useMemo(() => {
    const brands = new Set<string>(['Toyota', 'Honda', 'Shell', 'GS Astra', 'Mitsuba', 'Denso', 'Mobil1', 'Castrol']);
    records.forEach(r => {
      const val = r.brand;
      if (val) brands.add(val);
    });
    return Array.from(brands);
  }, [records]);

  // Dynamically compute unique customer categories from database records
  const uniqueCustomerCategories = useMemo(() => {
    const cats = new Set<string>(['Retail', 'Corporate', 'Government', 'Employee']);
    records.forEach(r => {
      if (activeMenu === 'customer') {
        const val = r.bpCategory;
        if (val) cats.add(val);
      }
    });
    return Array.from(cats);
  }, [records, activeMenu]);

  // Dynamically compute unique customer payment terms from database records
  const uniqueCustomerPaymentTerms = useMemo(() => {
    const terms = new Set<string>(['Immediate', '30 Days', '60 Days', 'COD']);
    records.forEach(r => {
      if (activeMenu === 'customer') {
        const val = r.paymentTerms;
        if (val) terms.add(val);
      }
    });
    return Array.from(terms);
  }, [records, activeMenu]);

  // Dynamically compute unique customer types from database records
  const uniqueCustomerTypes = useMemo(() => {
    const types = new Set<string>(['Customer', 'Prospect', 'Vendor+Customer', 'Employee']);
    records.forEach(r => {
      if (activeMenu === 'customer') {
        const val = r.bpType;
        if (val) types.add(val);
      }
    });
    return Array.from(types);
  }, [records, activeMenu]);

  // Local filter list based on search bar and dropdown filters
  const filteredRecords = useMemo(() => {
    return records.filter(rec => {
      // 1. Search Query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        let matchesSearch = false;
        
        if (activeMenu === 'sparepart') {
          matchesSearch = (rec.code || '').toLowerCase().includes(q) || 
                          (rec.name || '').toLowerCase().includes(q) || 
                          (rec.category || '').toLowerCase().includes(q) ||
                          (rec.productCategory || '').toLowerCase().includes(q) ||
                          (rec.searchKey || '').toLowerCase().includes(q) ||
                          (rec.brand || '').toLowerCase().includes(q);
        } else if (activeMenu === 'supplier') {
          matchesSearch = (rec.code || '').toLowerCase().includes(q) || (rec.name || '').toLowerCase().includes(q) || (rec.contact || '').toLowerCase().includes(q);
        } else if (activeMenu === 'customer') {
          matchesSearch = (rec.name || '').toLowerCase().includes(q) || 
                          (rec.commercialName || '').toLowerCase().includes(q) || 
                          (rec.fiscalName || '').toLowerCase().includes(q) || 
                          (rec.searchKey || '').toLowerCase().includes(q) || 
                          (rec.phone || '').toLowerCase().includes(q) || 
                          (rec.email || '').toLowerCase().includes(q) ||
                          (rec.paymentTerms || '').toLowerCase().includes(q) ||
                          (rec.salesRep || '').toLowerCase().includes(q) ||
                          (rec.address || '').toLowerCase().includes(q);
        } else if (activeMenu === 'vehicle') {
          matchesSearch = (rec.plateNumber || '').toLowerCase().includes(q) || (rec.model || '').toLowerCase().includes(q) || (rec.customer?.name || '').toLowerCase().includes(q);
        } else if (activeMenu === 'branch') {
          matchesSearch = (rec.name || '').toLowerCase().includes(q) || (rec.address || '').toLowerCase().includes(q);
        } else if (activeMenu === 'service') {
          matchesSearch = (rec.name || '').toLowerCase().includes(q) || (rec.category || '').toLowerCase().includes(q);
        }
        
        if (!matchesSearch) return false;
      }

      // 2. Extra Dropdown Filters for Spareparts
      if (activeMenu === 'sparepart') {
        if (filterCategory && (rec.productCategory || rec.category) !== filterCategory) {
          return false;
        }
        if (filterBrand && rec.brand !== filterBrand) {
          return false;
        }
        if (filterActive !== '') {
          const isActive = rec.flagActive !== false;
          if (filterActive === 'active' && !isActive) return false;
          if (filterActive === 'inactive' && isActive) return false;
        }
        if (filterConsignment !== '') {
          const isCons = !!rec.isConsignment;
          if (filterConsignment === 'consignment' && !isCons) return false;
          if (filterConsignment === 'regular' && isCons) return false;
        }
      }

      // 3. Extra Dropdown Filters for Customers
      if (activeMenu === 'customer') {
        if (custFilterBpCategory && rec.bpCategory !== custFilterBpCategory) {
          return false;
        }
        if (custFilterBpType && rec.bpType !== custFilterBpType) {
          return false;
        }
        if (custFilterPaymentTerms && rec.paymentTerms !== custFilterPaymentTerms) {
          return false;
        }
        if (custFilterActive !== '') {
          const isActive = rec.isActive !== false;
          if (custFilterActive === 'active' && !isActive) return false;
          if (custFilterActive === 'inactive' && isActive) return false;
        }
      }

      return true;
    });
  }, [
    records, 
    searchQuery, 
    activeMenu, 
    filterCategory, 
    filterBrand, 
    filterActive, 
    filterConsignment,
    custFilterBpCategory,
    custFilterBpType,
    custFilterPaymentTerms,
    custFilterActive
  ]);

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-slate-50/20 font-sans text-slate-800">
      
      {/* INTERNAL NAVIGATION SIDEBAR (LEFT) */}
      <aside className="w-80 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-6 pb-4 border-b border-indigo-50/40">
           <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase flex items-center gap-2 mb-1.5">
              <Database size={22} className="text-blue-600 shrink-0" /> Master Data
           </h2>
           <p className="text-[11px] text-slate-400 font-medium">Pengelolaan tabel data master utama sistem bengkel.</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
           {menuItems.map(item => {
             const Icon = item.icon;
             const active = activeMenu === item.id;
             return (
               <button 
                 key={item.id}
                 onClick={() => {
                   setActiveMenu(item.id);
                   setSearchQuery('');
                 }}
                 className={`w-full flex items-center justify-between p-3.5 rounded-xl transition-all group ${
                   active 
                    ? 'bg-blue-600 text-white shadow-md font-extrabold ring-1 ring-blue-500' 
                    : 'hover:bg-slate-50 text-slate-550 hover:text-slate-900'
                 }`}
               >
                 <div className="flex items-center gap-3">
                    <Icon size={16} className={active ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'} />
                    <span className="text-xs font-bold uppercase tracking-wide">{item.name}</span>
                 </div>
                 <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                   active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                 }`}>
                   {counts[item.id] !== undefined ? counts[item.id] : 0}
                 </span>
               </button>
             );
           })}
        </nav>

        <div className="p-5 bg-slate-50 border-t border-slate-100 shrink-0">
            <div className="flex items-center gap-2.5 p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-sm">
               <Terminal size={14} className="text-blue-500" />
               <div className="overflow-hidden">
                  <p className="text-[10px] font-extrabold text-slate-800 uppercase tracking-widest">Master Synchronizer</p>
                  <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider mt-0.5">Integrasi Database Online</p>
               </div>
            </div>
        </div>
      </aside>

      {/* CONTENT WORKSPACE VIEW (RIGHT) */}
      <main className="flex-1 overflow-y-auto bg-slate-50/40 p-6 flex flex-col gap-4">
        
        {/* UPPER TITLE BAR */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-250/60 p-4 px-6 rounded-2xl shadow-sm shrink-0">
           
           <div>
              <div className="flex items-center gap-1.5 text-blue-600 mb-1">
                 <Database size={13} />
                 <span className="text-[9px] font-black uppercase tracking-[0.2em]">{`Core Master Base`}</span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight uppercase flex items-center gap-2">
                <span>{menuItems.find(m => m.id === activeMenu)?.name}</span>
                {isLoading && (
                  <span className="text-xs font-semibold capitalize text-slate-400 animate-pulse">(Memuat...)</span>
                )}
              </h2>
           </div>

           <div className="flex items-center gap-2.5 shrink-0">
              <button 
                onClick={() => openModal()}
                className="flex items-center gap-1.5 px-4.5 py-2.5 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-slate-900/5 cursor-pointer"
              >
                 <Plus size={14} /> Input Data Baru
              </button>
           </div>

        </div>

        {/* FEEDBACK STATUS ALERTS */}
        <AnimatePresence>
          {successMessage && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-emerald-50 border border-emerald-250 text-emerald-800 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2"
            >
              <CheckCircle size={15} className="text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* REGISTRY SEARCH AND MASTER TABLE GRID */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
           
           {/* Filtering Toolbar */}
           <div className="p-3.5 border-b border-slate-200/85 flex flex-col xl:flex-row items-center justify-between gap-3 bg-slate-50/50 shrink-0">
              
              <div className="relative w-full max-w-sm shrink-0">
                 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Search size={14} />
                 </span>
                 <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={activeMenu === 'sparepart' ? "Cari Search Key, Name, Brand, SKU..." : activeMenu === 'customer' ? "Cari Commercial Name, Search Key, Fiscal Name, Telp..." : "Cari nama, kode atau no kendaraan..."}
                    className="w-full pl-9 pr-6 py-2 bg-white border border-slate-220/80 hover:border-slate-300 focus:border-blue-500 rounded-xl text-xs font-medium text-slate-800 outline-none transition-all"
                 />
                 {searchQuery && (
                   <button 
                     onClick={() => setSearchQuery('')}
                     className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-slate-800"
                   >
                     ✕
                   </button>
                 )}
              </div>

              {activeMenu === 'sparepart' && (
                <div className="flex flex-wrap items-center gap-3.5 w-full xl:w-auto mt-1 xl:mt-0">
                  {/* Category Filter */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-extrabold text-slate-450 uppercase select-none">Category:</span>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-slate-700 outline-none hover:border-slate-300 focus:border-blue-500"
                    >
                      <option value="">All Categories</option>
                      {uniqueCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Brand Filter */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-extrabold text-slate-450 uppercase select-none">Brand:</span>
                    <select
                      value={filterBrand}
                      onChange={(e) => setFilterBrand(e.target.value)}
                      className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-slate-700 outline-none hover:border-slate-300 focus:border-blue-500"
                    >
                      <option value="">All Brands</option>
                      {uniqueBrands.map(br => (
                        <option key={br} value={br}>{br}</option>
                      ))}
                    </select>
                  </div>

                  {/* Active Status Filter */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-extrabold text-slate-450 uppercase select-none">Status:</span>
                    <select
                      value={filterActive}
                      onChange={(e) => setFilterActive(e.target.value)}
                      className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-slate-700 outline-none hover:border-slate-300 focus:border-blue-500"
                    >
                      <option value="">All Statuses</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  {/* Consignment Filter */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-extrabold text-slate-450 uppercase select-none">Type:</span>
                    <select
                      value={filterConsignment}
                      onChange={(e) => setFilterConsignment(e.target.value)}
                      className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-slate-700 outline-none hover:border-slate-300 focus:border-blue-500"
                    >
                      <option value="">All Types</option>
                      <option value="consignment">Consignment Only</option>
                      <option value="regular">Regular Inventory</option>
                    </select>
                  </div>
                </div>
              )}

              {activeMenu === 'customer' && (
                <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto mt-1 xl:mt-0 select-none">
                  {/* BP Category Filter */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-extrabold text-slate-450 uppercase">Category:</span>
                    <select
                      value={custFilterBpCategory}
                      onChange={(e) => setCustFilterBpCategory(e.target.value)}
                      className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-slate-700 outline-none hover:border-slate-300 focus:border-blue-500"
                    >
                      <option value="">All Categories</option>
                      {uniqueCustomerCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* BP Type Filter */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-extrabold text-slate-450 uppercase">Type:</span>
                    <select
                      value={custFilterBpType}
                      onChange={(e) => setCustFilterBpType(e.target.value)}
                      className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-slate-700 outline-none hover:border-slate-300 focus:border-blue-500"
                    >
                      <option value="">All Types</option>
                      {uniqueCustomerTypes.map(tp => (
                        <option key={tp} value={tp}>{tp}</option>
                      ))}
                    </select>
                  </div>

                  {/* Payment Terms Filter */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-extrabold text-slate-450 uppercase">Terms:</span>
                    <select
                      value={custFilterPaymentTerms}
                      onChange={(e) => setCustFilterPaymentTerms(e.target.value)}
                      className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-slate-700 outline-none hover:border-slate-300 focus:border-blue-500"
                    >
                      <option value="">All Terms</option>
                      {uniqueCustomerPaymentTerms.map(term => (
                        <option key={term} value={term}>{term}</option>
                      ))}
                    </select>
                  </div>

                  {/* Active Status Filter */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-extrabold text-slate-450 uppercase">Status:</span>
                    <select
                      value={custFilterActive}
                      onChange={(e) => setCustFilterActive(e.target.value)}
                      className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-slate-700 outline-none hover:border-slate-300 focus:border-blue-500"
                    >
                      <option value="">All Statuses</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 justify-end w-full sm:w-auto shrink-0 select-none">
                 <div className="flex bg-slate-100 p-1 rounded-lg shrink-0 text-slate-400">
                    <span className="p-1 px-2 bg-white text-blue-600 rounded text-[10px] font-bold shadow-sm flex items-center gap-1">
                       <ListIcon size={12} /> List View
                    </span>
                 </div>
              </div>

           </div>

           {/* Dynamic Core Table viewport */}
           <div className="flex-1 overflow-auto">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center p-20 text-slate-400 italic gap-2.5">
                   <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                   <p className="text-xs">Sinkronisasi database...</p>
                </div>
              ) : filteredRecords.length === 0 ? (
                <div className="text-center py-20 text-slate-450 text-xs italic space-y-2 flex flex-col items-center">
                   <Info size={24} className="text-slate-300" />
                   <p>Data master tidak ditemukan atau masih kosong.</p>
                   <button 
                     onClick={() => openModal()}
                     className="text-xs font-bold text-blue-600 hover:text-blue-700 underline flex items-center gap-1 mt-1"
                   >
                     Input data pertama sekarang
                   </button>
                </div>
              ) : (
                <table className="w-full border-collapse text-xs text-left">
                   <thead className="bg-slate-50/30 border-b border-slate-150 text-slate-400 font-bold uppercase tracking-wider text-[10px] sticky top-0 bg-white z-10 select-none">
                      <tr>
                         <th className="px-6 py-4">No.</th>
                         {activeMenu === 'sparepart' && (
                           <>
                             <th className="px-6 py-4 text-slate-800">Search Key</th>
                             <th className="px-6 py-4 text-slate-800">Name</th>
                             <th className="px-6 py-4 text-slate-800">Product Category</th>
                             <th className="px-6 py-4 text-slate-800">Product Type</th>
                             <th className="px-6 py-4 text-slate-800">Brand</th>
                             <th className="px-6 py-4 text-slate-800">UOM</th>
                             <th className="px-6 py-4 text-slate-800">Active Status</th>
                             <th className="px-6 py-4 text-center text-slate-800">Purchase</th>
                             <th className="px-6 py-4 text-center text-slate-800">Sale</th>
                             <th className="px-6 py-4 text-center text-slate-800">Stocked</th>
                             <th className="px-6 py-4 text-center text-slate-800">Consignment</th>
                           </>
                         )}
                         {activeMenu === 'supplier' && (
                           <>
                             <th className="px-6 py-4">Kode Supp</th>
                             <th className="px-6 py-4">Nama Supplier</th>
                             <th className="px-6 py-4">Narahubung</th>
                             <th className="px-6 py-4">No Telepon</th>
                             <th className="px-6 py-4">Termin</th>
                             <th className="px-6 py-4">Tipe</th>
                             <th className="px-6 py-4">Alamat</th>
                           </>
                         )}
                         {activeMenu === 'customer' && (
                           <>
                             <th className="px-6 py-4">Search Key</th>
                              <th className="px-6 py-4">Commercial Name</th>
                              <th className="px-6 py-4">Partner Category</th>
                              <th className="px-6 py-4">Partner Type</th>
                              <th className="px-6 py-4">Payment Terms</th>
                              <th className="px-6 py-4">Sales Rep</th>
                              <th className="px-6 py-4">Active Status</th>
                           </>
                         )}
                         {activeMenu === 'vehicle' && (
                           <>
                             <th className="px-6 py-4">Nomor Polisi</th>
                             <th className="px-6 py-4">Model / Brand</th>
                             <th className="px-6 py-4">No. Rangka</th>
                             <th className="px-6 py-4">No. Mesin</th>
                             <th className="px-6 py-4">Pemilik Utama</th>
                             <th className="px-6 py-4">Kontak Pemilik</th>
                           </>
                         )}
                         {activeMenu === 'branch' && (
                           <>
                             <th className="px-6 py-4">Nama Workshop</th>
                             <th className="px-6 py-4 font-mono text-[9px]">ID / Code</th>
                             <th className="px-6 py-4">No Telepon</th>
                             <th className="px-6 py-4">Alamat Cabang</th>
                           </>
                         )}
                         {activeMenu === 'service' && (
                           <>
                             <th className="px-6 py-4">ID Jasa</th>
                             <th className="px-6 py-4">Nama Jasa / Pekerjaan</th>
                             <th className="px-6 py-4">Kategori</th>
                             <th className="px-6 py-4 text-right">Tarif Dasar</th>
                           </>
                         )}
                         <th className="px-6 py-4 text-right">Aksi</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                      {filteredRecords.map((rec, idx) => (
                         <tr key={rec.id || `rec-${idx}`} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 text-slate-400 font-mono font-medium">{idx + 1}</td>
                            
                            {activeMenu === 'sparepart' && (
                              <>
                                <td className="px-6 py-4 font-mono text-slate-500 uppercase tracking-wider">{rec.searchKey || '-'}</td>
                                <td className="px-6 py-4">
                                  <div className="font-extrabold text-slate-900">{rec.name || '-'}</div>
                                  <div className="flex flex-wrap gap-x-2.5 gap-y-0.5 text-[9px] font-mono mt-0.5 select-none">
                                    <span className="text-slate-400">SKU/ID: {rec.partCode || rec.code || '-'}</span>
                                    <span className="text-emerald-700 font-extrabold">● Jual: ${Number(rec.basePrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                    <span className="text-blue-700 font-extrabold">● Beli: ${Number(rec.purchasePrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="bg-indigo-50 border border-indigo-150 px-2 py-0.5 rounded text-[10px] font-extrabold text-indigo-700 capitalize">
                                    {rec.productCategory || rec.category || '-'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-slate-600 font-bold">{rec.productType || 'Goods'}</td>
                                <td className="px-6 py-4 font-extrabold text-slate-700">{rec.brand || '-'}</td>
                                <td className="px-6 py-4 text-slate-500 font-bold uppercase">{rec.uom || rec.unit || 'pcs'}</td>
                                <td className="px-6 py-4">
                                  {rec.flagActive !== false ? (
                                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[9px] font-black uppercase">Active</span>
                                  ) : (
                                    <span className="bg-slate-100 text-slate-400 border border-slate-200 px-2 py-0.5 rounded text-[9px] font-black uppercase">Inactive</span>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-center">
                                  {rec.flagPurchase !== false ? (
                                    <span className="text-emerald-600 font-black text-xs">✓</span>
                                  ) : (
                                    <span className="text-slate-300 font-black">-</span>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-center">
                                  {rec.flagSale !== false ? (
                                    <span className="text-emerald-600 font-black text-xs">✓</span>
                                  ) : (
                                    <span className="text-slate-300 font-black">-</span>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-center">
                                  {rec.flagStocked !== false ? (
                                    <span className="text-emerald-600 font-black text-xs">✓</span>
                                  ) : (
                                    <span className="text-slate-300 font-black">-</span>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-center">
                                  {rec.isConsignment ? (
                                    <span className="text-[9px] font-black bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded">CONSIGNMENT</span>
                                  ) : (
                                    <span className="text-[9px] font-bold text-slate-400">REGULAR</span>
                                  )}
                                </td>
                              </>
                            )}

                            {activeMenu === 'supplier' && (
                              <>
                                <td className="px-6 py-4 font-mono font-bold text-slate-800">{rec.code}</td>
                                <td className="px-6 py-4 font-black text-slate-800 uppercase">{rec.name}</td>
                                <td className="px-6 py-4 font-semibold text-slate-700">{rec.contact || '-'}</td>
                                <td className="px-6 py-4 font-mono text-slate-500">{rec.phone || '-'}</td>
                                <td className="px-6 py-4 font-extrabold text-slate-700">{rec.paymentTerm}</td>
                                <td className="px-6 py-4">
                                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-extrabold text-[9px] rounded uppercase border border-blue-100">{rec.type}</span>
                                </td>
                                <td className="px-6 py-4 text-slate-450 truncate max-w-[150px]" title={rec.address}>{rec.address || '-'}</td>
                              </>
                            )}

                            {activeMenu === 'customer' && (
                              <>
                                <td className="px-6 py-4 font-mono font-bold text-slate-700">{rec.searchKey || '-'}</td>
                                <td className="px-6 py-4">
                                  <p className="font-extrabold text-slate-900 uppercase">{rec.commercialName || rec.name || '-'}</p>
                                  <p className="text-[9px] font-mono text-slate-400 select-none">ID: {rec.id?.slice(0, 8)}</p>
                                </td>
                                <td className="px-6 py-4 font-semibold text-slate-650">{rec.bpCategory || 'Retail'}</td>
                                <td className="px-6 py-4 font-semibold text-slate-650">{rec.bpType || 'Customer'}</td>
                                <td className="px-6 py-4 font-mono font-bold text-indigo-600">{rec.paymentTerms || 'Immediate'}</td>
                                <td className="px-6 py-4 font-semibold text-slate-600">{rec.salesRep || '-'}</td>
                                <td className="px-6 py-4">
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${rec.isActive !== false ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                                    {rec.isActive !== false ? 'Active' : 'Inactive'}
                                  </span>
                                </td>
                              </>
                            )}

                            {activeMenu === 'vehicle' && (
                              <>
                                <td className="px-6 py-4">
                                  <span className="font-mono bg-blue-50 text-blue-700 border border-blue-100 font-extrabold text-xs px-2 py-1 rounded truncate">{rec.plateNumber}</span>
                                </td>
                                <td className="px-6 py-4 font-bold text-slate-750 uppercase">{rec.model || '-'}</td>
                                <td className="px-6 py-4 font-mono text-slate-450 truncate" title={rec.chassisNumber}>{rec.chassisNumber || '-'}</td>
                                <td className="px-6 py-4 font-mono text-slate-450 truncate" title={rec.engineNumber}>{rec.engineNumber || '-'}</td>
                                <td className="px-6 py-4 font-extrabold text-indigo-700 uppercase">{rec.customer?.name || 'Walk-in'}</td>
                                <td className="px-6 py-4 font-mono text-slate-450">{rec.customer?.phone || '-'}</td>
                              </>
                            )}

                            {activeMenu === 'branch' && (
                              <>
                                <td className="px-6 py-4 font-black text-slate-800 uppercase">{rec.name}</td>
                                <td className="px-6 py-4 font-mono text-slate-350 select-all">{rec.id?.slice(0, 8)}</td>
                                <td className="px-6 py-4 font-mono font-semibold text-slate-650">{rec.phone || '-'}</td>
                                <td className="px-6 py-4 text-slate-400 max-w-[200px] truncate" title={rec.address}>{rec.address}</td>
                              </>
                            )}

                            {activeMenu === 'service' && (
                              <>
                                <td className="px-6 py-4 font-mono text-slate-400 uppercase font-black">{rec.id?.slice(0, 6)}</td>
                                <td className="px-6 py-4 font-bold text-slate-800 uppercase">{rec.name}</td>
                                <td className="px-6 py-4 capitalize">
                                  <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold">{rec.category || 'General'}</span>
                                </td>
                                <td className="px-6 py-4 text-right font-mono font-extrabold text-slate-900">${Number(rec.standardPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                              </>
                            )}

                            {/* Direct Actions Cell */}
                            <td className="px-6 py-4 text-right whitespace-nowrap">
                               <div className="flex items-center justify-end gap-1.5">
                                 <button 
                                   onClick={() => openModal(rec)}
                                   className="p-1 px-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded border border-slate-200 text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                                 >
                                   <Edit size={12} /> Edit
                                 </button>
                                 <button 
                                   onClick={() => handleDelete(rec.id, rec.name || rec.plateNumber || rec.code)}
                                   className="p-1 px-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-250/20 text-rose-600 rounded text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                                 >
                                   <Trash2 size={12} /> Hapus
                                 </button>
                               </div>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
              )}
           </div>

        </div>

      </main>

      {/* INPUT/EDIT FORM POPUP OVERLAY MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Head */}
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-950 uppercase tracking-tight">
                    {selectedRecord ? 'Update Data' : 'Input Data Master Baru'}
                  </h3>
                  <p className="text-[10px] text-slate-400 capitalize font-bold mt-0.5">Modul: {activeMenu}</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-900 p-1 hover:bg-slate-50 rounded-lg transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Form Failure Alerts */}
              {errorMessage && (
                <div className="bg-rose-50 border border-rose-200/50 p-3 rounded-lg flex items-center gap-2 text-xs font-bold text-rose-700">
                  <AlertCircle size={14} className="shrink-0 text-rose-500" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Modal Core Form Body */}
              <form onSubmit={handleSave} className="space-y-4 text-xs">
                
                {activeMenu === 'sparepart' && (
                  <div className="space-y-4">
                    
                    {/* SECTION 1: GENERAL INFORMATION */}
                    <div className="bg-slate-55/20 p-4 rounded-xl border border-slate-200/80 space-y-3.5">
                      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 mb-1.5">
                        <span className="w-1.5 h-3.5 bg-blue-600 rounded"></span>
                        <h4 className="font-extrabold text-[10px] text-slate-800 uppercase tracking-wider">1. General Information</h4>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Search Key <span className="text-red-500">*</span></label>
                          <input 
                            type="text" 
                            required
                            value={formData.searchKey || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, searchKey: e.target.value }))}
                            className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-lg py-2 px-3 text-xs font-semibold outline-none"
                            placeholder="e.g. TOY-FIL-01"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Name <span className="text-red-500">*</span></label>
                          <input 
                            type="text" 
                            required
                            value={formData.name || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-lg py-2 px-3 text-xs font-semibold outline-none"
                            placeholder="e.g. Air Filter Toyota Genuine"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Product Category</label>
                          <select 
                            value={formData.productCategory || formData.category || 'Lubricants'}
                            onChange={(e) => setFormData(prev => ({ ...prev, productCategory: e.target.value, category: e.target.value }))}
                            className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-xs font-bold outline-none text-slate-705"
                          >
                            <option value="Lubricants">Lubricants / Pelumas</option>
                            <option value="Brake">Brake / Rem</option>
                            <option value="Engine Parts">Engine / Komponen Mesin</option>
                            <option value="Electrical">Electrical / Aki / Kelistrikan</option>
                            <option value="Filters">Filters / Filter Udara / Oli</option>
                            <option value="Undercarriage">Undercarriage / Kaki-Kaki</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Product Type</label>
                          <select 
                            value={formData.productType || 'Goods'}
                            onChange={(e) => setFormData(prev => ({ ...prev, productType: e.target.value }))}
                            className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-xs font-bold outline-none text-slate-705"
                          >
                            <option value="Goods">Goods / Barang Jadi</option>
                            <option value="Service">Service / Jasa Pekerjaan</option>
                            <option value="Expense">Expense / Keperluan Workshop</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">UOM (Unit Of Measure) <span className="text-red-500">*</span></label>
                          <input 
                            type="text" 
                            required
                            value={formData.uom || formData.unit || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, uom: e.target.value, unit: e.target.value }))}
                            className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-lg py-2 px-3 text-xs font-bold outline-none"
                            placeholder="pcs, Litre, Bottle, Box..."
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Harga Beli ($) <span className="text-red-500">*</span></label>
                          <input 
                            type="number" 
                            step="0.01"
                            required
                            value={formData.purchasePrice !== undefined ? formData.purchasePrice : 0}
                            onChange={(e) => setFormData(prev => ({ ...prev, purchasePrice: parseFloat(e.target.value) || 0 }))}
                            className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-lg py-2 px-3 text-xs font-black outline-none font-mono"
                            placeholder="0.00"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Harga Jual ($) <span className="text-red-500">*</span></label>
                          <input 
                            type="number" 
                            step="0.01"
                            required
                            value={formData.basePrice !== undefined ? formData.basePrice : 0}
                            onChange={(e) => setFormData(prev => ({ ...prev, basePrice: parseFloat(e.target.value) || 0 }))}
                            className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-lg py-2 px-3 text-xs font-black outline-none font-mono"
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Description</label>
                        <textarea 
                          value={formData.description || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-lg py-1.5 px-3 text-xs font-semibold outline-none min-h-[50px] resize-y"
                          placeholder="Tulis deskripsi / catatan sparepart..."
                        />
                      </div>
                    </div>

                    {/* SECTION 2: PRODUCT CONFIGURATION */}
                    <div className="bg-slate-55/20 p-4 rounded-xl border border-slate-200/80 space-y-3">
                      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 mb-1.5">
                        <span className="w-1.5 h-3.5 bg-blue-600 rounded"></span>
                        <h4 className="font-extrabold text-[10px] text-slate-800 uppercase tracking-wider">2. Product Configuration</h4>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-y-3.5 px-1 pt-1">
                        <label className="flex items-center gap-2 select-none cursor-pointer">
                          <input 
                            type="checkbox"
                            checked={formData.flagPurchase !== false}
                            onChange={(e) => setFormData(prev => ({ ...prev, flagPurchase: e.target.checked }))}
                            className="w-4 h-4 text-blue-600 border-slate-250 rounded focus:ring-0"
                          />
                          <span className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wide">Purchase</span>
                        </label>

                        <label className="flex items-center gap-2 select-none cursor-pointer">
                          <input 
                            type="checkbox"
                            checked={formData.flagSale !== false}
                            onChange={(e) => setFormData(prev => ({ ...prev, flagSale: e.target.checked }))}
                            className="w-4 h-4 text-blue-600 border-slate-250 rounded focus:ring-0"
                          />
                          <span className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wide">Sale</span>
                        </label>

                        <label className="flex items-center gap-2 select-none cursor-pointer">
                          <input 
                            type="checkbox"
                            checked={formData.flagStocked !== false}
                            onChange={(e) => setFormData(prev => ({ ...prev, flagStocked: e.target.checked }))}
                            className="w-4 h-4 text-blue-600 border-slate-250 rounded focus:ring-0"
                          />
                          <span className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wide">Stocked</span>
                        </label>

                        <label className="flex items-center gap-2 select-none cursor-pointer">
                          <input 
                            type="checkbox"
                            checked={formData.flagActive !== false}
                            onChange={(e) => setFormData(prev => ({ ...prev, flagActive: e.target.checked }))}
                            className="w-4 h-4 text-blue-600 border-slate-250 rounded focus:ring-0"
                          />
                          <span className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wide">Active Status</span>
                        </label>

                        <label className="flex items-center gap-2 col-span-2 mt-1 select-none cursor-pointer border-t border-slate-200/50 pt-2.5">
                          <input 
                            type="checkbox"
                            checked={formData.isConsignment || false}
                            onChange={(e) => setFormData(prev => ({ ...prev, isConsignment: e.target.checked }))}
                            className="w-4 h-4 text-amber-500 border-slate-250 rounded focus:ring-0"
                          />
                          <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wide">Consignment / Barang Konsinyasi Supplier</span>
                        </label>
                      </div>
                    </div>

                    {/* SECTION 3: PRODUCT ATTRIBUTES */}
                    <div className="bg-slate-55/20 p-4 rounded-xl border border-slate-200/80 space-y-3.5">
                      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 mb-1.5">
                        <span className="w-1.5 h-3.5 bg-blue-600 rounded"></span>
                        <h4 className="font-extrabold text-[10px] text-slate-800 uppercase tracking-wider">3. Product Attributes</h4>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Type Series</label>
                          <input 
                            type="text" 
                            value={formData.typeSeries || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, typeSeries: e.target.value }))}
                            className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-lg py-2 px-3 text-xs font-semibold outline-none"
                            placeholder="e.g. Hilux 2GD-FTV"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Brand</label>
                          <input 
                            type="text" 
                            value={formData.brand || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                            className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-lg py-2 px-3 text-xs font-semibold outline-none"
                            placeholder="e.g. Denso, Toyota"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Quality</label>
                          <select 
                            value={formData.quality || 'Original'}
                            onChange={(e) => setFormData(prev => ({ ...prev, quality: e.target.value }))}
                            className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-xs font-bold outline-none text-slate-705"
                          >
                            <option value="Original">Original / Genuine Part</option>
                            <option value="OEM">OEM (Original Equipment Manufacturer)</option>
                            <option value="Aftermarket">Aftermarket Premium</option>
                            <option value="Imitasi">Imitasi / Lokal</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Part Code / Kode Part <span className="text-red-500">*</span></label>
                          <input 
                            type="text" 
                            required
                            value={formData.partCode || formData.code || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, partCode: e.target.value, code: e.target.value }))}
                            className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-lg py-2 px-3 text-xs font-bold outline-none uppercase font-mono"
                            placeholder="e.g. Toyota-90915-10001"
                          />
                        </div>
                      </div>
                    </div>

                    {/* SECTION 4: LIFETIME INFORMATION */}
                    <div className="bg-slate-55/20 p-4 rounded-xl border border-slate-200/80 space-y-3">
                      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 mb-1.5">
                        <span className="w-1.5 h-3.5 bg-blue-600 rounded"></span>
                        <h4 className="font-extrabold text-[10px] text-slate-800 uppercase tracking-wider">4. Lifetime Information</h4>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Lifetime Kilometer (Km)</label>
                          <input 
                            type="number" 
                            value={formData.lifetimeKm || 0}
                            onChange={(e) => setFormData(prev => ({ ...prev, lifetimeKm: parseInt(e.target.value) || 0 }))}
                            className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-lg py-2 px-3 text-xs font-bold outline-none font-mono"
                            placeholder="10000"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Lifetime Month</label>
                          <input 
                            type="number" 
                            value={formData.lifetimeMonth || 0}
                            onChange={(e) => setFormData(prev => ({ ...prev, lifetimeMonth: parseInt(e.target.value) || 0 }))}
                            className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-lg py-2 px-3 text-xs font-bold outline-none font-mono"
                            placeholder="12"
                          />
                        </div>
                      </div>
                    </div>

                  </div>
                )}

                {activeMenu === 'supplier' && (
                  <div className="space-y-3.5">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Kode Supplier <span className="text-red-500">*</span></label>
                        <input 
                          type="text" 
                          required
                          value={formData.code || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                          className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg py-2 px-3 text-xs font-bold outline-none uppercase font-mono"
                          placeholder="SUP-AAAA"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Nama Supplier <span className="text-red-500">*</span></label>
                        <input 
                          type="text" 
                          required
                          value={formData.name || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg py-2 px-3 text-xs font-semibold outline-none"
                          placeholder="Astra Otoparts dll."
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Narahubung / Sales</label>
                        <input 
                          type="text" 
                          value={formData.contact || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, contact: e.target.value }))}
                          className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg py-2 px-3 text-xs font-semibold outline-none"
                          placeholder="e.g. Budi Susetio"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">No. Telefon</label>
                        <input 
                          type="text" 
                          value={formData.phone || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg py-2 px-3 text-xs font-mono outline-none"
                          placeholder="+62-...."
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Tipe KerjaSama</label>
                        <select 
                          value={formData.type || 'Regular'}
                          onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs font-bold outline-none"
                        >
                          <option value="Regular">Regular</option>
                          <option value="Import">Import</option>
                          <option value="Main Distributor">Main Distributor / ATPM</option>
                          <option value="Cooperation">Kemitraan</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Termin Pembayaran</label>
                        <select 
                          value={formData.paymentTerm || 'Net 30'}
                          onChange={(e) => setFormData(prev => ({ ...prev, paymentTerm: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs font-bold outline-none"
                        >
                          <option value="COD">Tunai / COD</option>
                          <option value="Net 15">Net 15 Hari</option>
                          <option value="Net 30">Net 30 Hari</option>
                          <option value="Net 45">Net 45 Hari</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Alamat Supplier</label>
                      <textarea 
                        rows={2}
                        value={formData.address || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg py-2 px-3 text-xs outline-none"
                        placeholder="Alamat kantor, gudang dsb..."
                      />
                    </div>
                  </div>
                )}

                {activeMenu === 'customer' && (
                  <div className="space-y-5 select-none">
                    
                    {/* SECTION 1: GENERAL INFORMATION */}
                    <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200/85 space-y-3.5">
                      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 mb-1.5">
                        <span className="bg-blue-600 text-white w-4.5 h-4.5 rounded-full flex items-center justify-center text-[10px] font-black">1</span>
                        <h4 className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider">General Information</h4>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Search Key <span className="text-red-500">*</span></label>
                          <input 
                            type="text" 
                            required
                            value={formData.searchKey || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, searchKey: e.target.value }))}
                            className="w-full bg-white focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg py-2 px-3 text-xs font-bold outline-none font-mono"
                            placeholder="e.g. CUST001"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Commercial Name <span className="text-red-500">*</span></label>
                          <input 
                            type="text" 
                            required
                            value={formData.commercialName || formData.name || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, commercialName: e.target.value, name: e.target.value }))}
                            className="w-full bg-white focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg py-2 px-3 text-xs font-semibold outline-none"
                            placeholder="Nama komersil perusahaan / individu..."
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Business Partner Category <span className="text-red-500">*</span></label>
                          <select 
                            value={formData.bpCategory || 'Retail'}
                            onChange={(e) => setFormData(prev => ({ ...prev, bpCategory: e.target.value }))}
                            className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-xs font-bold outline-none"
                          >
                            <option value="Retail">Retail / Individual</option>
                            <option value="Corporate">Corporate / Fleet</option>
                            <option value="Government">Government / Instansi</option>
                            <option value="Employee">Employee / Internal</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Business Partner Type <span className="text-red-500">*</span></label>
                          <select 
                            value={formData.bpType || 'Customer'}
                            onChange={(e) => setFormData(prev => ({ ...prev, bpType: e.target.value }))}
                            className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-xs font-bold outline-none"
                          >
                            <option value="Customer">Only Customer</option>
                            <option value="Prospect">Prospect Partner</option>
                            <option value="Vendor+Customer">Vendor & Customer Mutual</option>
                            <option value="Employee">Employee Partner</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Nationality</label>
                          <input 
                            type="text" 
                            value={formData.nationality || 'Indonesia'}
                            onChange={(e) => setFormData(prev => ({ ...prev, nationality: e.target.value }))}
                            className="w-full bg-white focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg py-2 px-3 text-xs font-semibold outline-none"
                            placeholder="Kewarganegaraan..."
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Entity Profile</label>
                          <input 
                            type="text" 
                            value={formData.entityProfile || 'Individual'}
                            onChange={(e) => setFormData(prev => ({ ...prev, entityProfile: e.target.value }))}
                            className="w-full bg-white focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg py-2 px-3 text-xs font-semibold outline-none"
                            placeholder="e.g. PT, CV, Perorangan..."
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Tax ID / NPWP</label>
                          <input 
                            type="text" 
                            value={formData.taxId || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, taxId: e.target.value }))}
                            className="w-full bg-white focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg py-2 px-3 text-xs font-mono outline-none"
                            placeholder="e.g. 01.234.567.8-901.000"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Fiscal Name</label>
                          <input 
                            type="text" 
                            value={formData.fiscalName || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, fiscalName: e.target.value }))}
                            className="w-full bg-white focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg py-2 px-3 text-xs font-semibold outline-none"
                            placeholder="Nama wajib pajak resmi..."
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2">
                          <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Website URL</label>
                          <input 
                            type="text" 
                            value={formData.url || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                            className="w-full bg-white focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg py-2 px-3 text-xs font-mono outline-none"
                            placeholder="https://..."
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Reference No</label>
                          <input 
                            type="text" 
                            value={formData.referenceNo || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, referenceNo: e.target.value }))}
                            className="w-full bg-white focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg py-2 px-3 text-xs font-mono font-bold outline-none"
                            placeholder="External ID..."
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 items-end">
                        <div className="col-span-1">
                          <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Consumption Days</label>
                          <input 
                            type="number" 
                            value={formData.consumptionDays || 30}
                            onChange={(e) => setFormData(prev => ({ ...prev, consumptionDays: parseInt(e.target.value) || 0 }))}
                            className="w-full bg-white focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg py-2 px-3 text-xs font-mono font-bold outline-none"
                          />
                        </div>
                        <div className="col-span-2 flex items-center gap-4 py-2 px-1">
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-650">
                            <input 
                              type="checkbox"
                              checked={formData.isActive !== false}
                              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                              className="accent-blue-600 rounded"
                            />
                            <span>Active Status</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-650">
                            <input 
                              type="checkbox"
                              checked={!!formData.summaryLevel}
                              onChange={(e) => setFormData(prev => ({ ...prev, summaryLevel: e.target.checked }))}
                              className="accent-blue-600 rounded"
                            />
                            <span>Summary Level</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Description / Catatan Umum</label>
                        <textarea 
                          rows={2}
                          value={formData.description || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          className="w-full bg-white focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg py-2 px-3 text-xs outline-none"
                          placeholder="Keterangan tambahan partner..."
                        />
                      </div>
                    </div>

                    {/* SECTION 2: CUSTOMER INFORMATION */}
                    <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200/85 space-y-3.5">
                      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 mb-1.5">
                        <span className="bg-blue-600 text-white w-4.5 h-4.5 rounded-full flex items-center justify-center text-[10px] font-black">2</span>
                        <h4 className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider">Customer & Billing Configuration</h4>
                      </div>

                      <div className="flex flex-wrap items-center gap-5 bg-white p-3 rounded-xl border border-slate-200/60 shadow-inner">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-705">
                          <input 
                            type="checkbox"
                            checked={formData.isCustomer !== false}
                            onChange={(e) => setFormData(prev => ({ ...prev, isCustomer: e.target.checked }))}
                            className="accent-blue-600 rounded"
                          />
                          <span>Partner is Customer</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-705">
                          <input 
                            type="checkbox"
                            checked={!!formData.taxExempt}
                            onChange={(e) => setFormData(prev => ({ ...prev, taxExempt: e.target.checked }))}
                            className="accent-blue-600 rounded"
                          />
                          <span>Tax Exempt (Bebas Pajak)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-705">
                          <input 
                            type="checkbox"
                            checked={!!formData.onHold}
                            onChange={(e) => setFormData(prev => ({ ...prev, onHold: e.target.checked }))}
                            className="accent-rose-600 rounded-sm"
                          />
                          <span className={formData.onHold ? "text-rose-600" : ""}>Transaction On Hold (Tangguhkan)</span>
                        </label>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Financial Account</label>
                          <input 
                            type="text" 
                            value={formData.financialAccount || 'Cash Account'}
                            onChange={(e) => setFormData(prev => ({ ...prev, financialAccount: e.target.value }))}
                            className="w-full bg-white focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg py-2 px-3 text-xs font-bold outline-none"
                            placeholder="Cash / Bank Account Name..."
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Price List Category <span className="text-red-500">*</span></label>
                          <select 
                            value={formData.priceList || 'Standard Price List'}
                            onChange={(e) => setFormData(prev => ({ ...prev, priceList: e.target.value }))}
                            className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-xs font-bold outline-none"
                          >
                            <option value="Standard Price List">Standard Price List</option>
                            <option value="Wholesale Price List">Wholesale Price List</option>
                            <option value="VIP Member Price List">VIP Member Price List</option>
                            <option value="Partner Fleet Price List">Partner Fleet Special</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Payment Method</label>
                          <select 
                            value={formData.paymentMethod || 'Cash'}
                            onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                            className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-xs font-bold outline-none"
                          >
                            <option value="Cash">Cash / Tunai</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                            <option value="Credit Card">Credit Card</option>
                            <option value="E-Wallet">E-Wallet QRIS</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Payment Terms</label>
                          <select 
                            value={formData.paymentTerms || 'Immediate'}
                            onChange={(e) => setFormData(prev => ({ ...prev, paymentTerms: e.target.value }))}
                            className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-xs font-bold outline-none"
                          >
                            <option value="Immediate">Immediate / Cash</option>
                            <option value="30 Days">Net 30 Days Credit</option>
                            <option value="60 Days">Net 60 Days Credit</option>
                            <option value="COD">C.O.D (Cash on Delivery)</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Invoice Terms</label>
                          <select 
                            value={formData.invoiceTerms || 'Immediate'}
                            onChange={(e) => setFormData(prev => ({ ...prev, invoiceTerms: e.target.value }))}
                            className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-xs font-bold outline-none"
                          >
                            <option value="Immediate">Immediate / Per Service</option>
                            <option value="Weekly">Weekly Consolidated</option>
                            <option value="Monthly">Monthly Consolidated</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Sales Representative Assigned</label>
                        <input 
                          type="text" 
                          value={formData.salesRep || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, salesRep: e.target.value }))}
                          className="w-full bg-white focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg py-2 px-3 text-xs font-semibold outline-none"
                          placeholder="Nama Sales Rep ERP..."
                        />
                      </div>
                    </div>

                    {/* SECTION 3: CONTACT INFORMATION */}
                    <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200/85 space-y-3.5">
                      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 mb-1.5">
                        <span className="bg-blue-600 text-white w-4.5 h-4.5 rounded-full flex items-center justify-center text-[10px] font-black">3</span>
                        <h4 className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider">Contact Information</h4>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Email Address</label>
                          <input 
                            type="email" 
                            value={formData.email || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full bg-white focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg py-2 px-3 text-xs font-mono outline-none"
                            placeholder="e.g. contact@domain.com"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">No. Telefon / Whatsapp <span className="text-red-500">*</span></label>
                          <input 
                            type="text" 
                            required
                            value={formData.phone || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                            className="w-full bg-white focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg py-2 px-3 text-xs font-mono font-bold outline-none"
                            placeholder="e.g. 081234567..."
                          />
                        </div>
                      </div>
                    </div>

                    {/* SECTION 4: ADDRESS INFORMATION */}
                    <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200/85 space-y-3.5">
                      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 mb-1.5">
                        <span className="bg-blue-600 text-white w-4.5 h-4.5 rounded-full flex items-center justify-center text-[10px] font-black">4</span>
                        <h4 className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider">Address Information</h4>
                      </div>

                      <div>
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Alamat Penagihan & Pengiriman Utama</label>
                        <textarea 
                          rows={2}
                          value={formData.address || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                          className="w-full bg-white focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg py-2 px-3 text-xs outline-none"
                          placeholder="Alamat domisili detail..."
                        />
                      </div>
                    </div>

                     {/* SECTION 5: VEHICLE INFORMATION */}
                     <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200/85 space-y-3.5">
                       <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-1.5 flex-wrap gap-2">
                         <div className="flex items-center gap-1.5">
                           <span className="bg-blue-600 text-white w-4.5 h-4.5 rounded-full flex items-center justify-center text-[10px] font-black">5</span>
                           <h4 className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider">Vehicle Information</h4>
                         </div>
                         {selectedRecord && (
                           <button
                             type="button"
                             onClick={() => {
                               const custId = selectedRecord.id;
                               setIsModalOpen(false);
                               setActiveMenu('vehicle');
                               setTimeout(() => {
                                 setSelectedRecord(null);
                                 setErrorMessage('');
                                 setIsCreatingNewCustomerInVehicleForm(false);
                                 setFormData({
                                   plateNumber: '',
                                   model: '',
                                   chassisNumber: '',
                                   engineNumber: '',
                                   customerId: custId
                                 });
                                 setIsModalOpen(true);
                               }, 150);
                             }}
                             className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/80 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1"
                           >
                             <Plus size={10} className="stroke-[3px]" />
                             Daftarkan Kendaraan
                           </button>
                         )}
                       </div>

                      {selectedRecord ? (
                        <div>
                          {vehicles.filter(v => v.customerId === selectedRecord.id).length > 0 ? (
                            <div className="bg-white rounded-lg border border-slate-200/70 overflow-hidden">
                              <table className="min-w-full divide-y divide-slate-100 text-[10px]">
                                <thead className="bg-slate-50">
                                  <tr>
                                    <th className="px-3 py-2 text-left font-extrabold text-slate-500 uppercase">No. Polisi</th>
                                    <th className="px-3 py-2 text-left font-extrabold text-slate-500 uppercase">Model / Varian</th>
                                    <th className="px-3 py-2 text-left font-extrabold text-slate-500 uppercase">Rangka</th>
                                    <th className="px-3 py-2 text-left font-extrabold text-slate-500 uppercase">Mesin</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                  {vehicles.filter(v => v.customerId === selectedRecord.id).map(v => (
                                    <tr key={v.id}>
                                      <td className="px-3 py-2 font-mono font-bold text-blue-700">{v.plateNumber}</td>
                                      <td className="px-3 py-2 font-bold text-slate-700">{v.model}</td>
                                      <td className="px-3 py-2 font-mono text-slate-400">{v.chassisNumber || '-'}</td>
                                      <td className="px-3 py-2 font-mono text-slate-400">{v.engineNumber || '-'}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <p className="text-slate-450 font-bold p-3 text-center bg-white border border-dashed border-slate-200 rounded-lg text-[10px]">
                              Belum ada kendaraan yang terdaftar atas nama pelanggan ini.
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="bg-white p-3 rounded-lg border border-dashed border-slate-200 text-center text-slate-450 text-[10px] font-semibold">
                          Informasi kendaraan dapat dihubungkan di tab "Vehicle Master" setelah Partner baru berhasil didaftarkan.
                        </div>
                      )}
                    </div>

                  </div>
                )}

                {activeMenu === 'vehicle' && (
                  <div className="space-y-3.5">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Nomor Polisi <span className="text-red-500">*</span></label>
                        <input 
                          type="text" 
                          required
                          value={formData.plateNumber || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, plateNumber: e.target.value }))}
                          className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg py-2 px-3 text-xs font-black uppercase font-mono outline-none"
                          placeholder="e.g. B 1234 ABC"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Model / Varian / Brand <span className="text-red-500">*</span></label>
                        <input 
                          type="text" 
                          required
                          value={formData.model || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                          className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg py-2 px-3 text-xs font-bold outline-none uppercase"
                          placeholder="e.g. Toyota Fortuner VRZ"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Nomor Rangka (Chassis)</label>
                        <input 
                          type="text" 
                          value={formData.chassisNumber || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, chassisNumber: e.target.value }))}
                          className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg py-2 px-3 text-xs font-mono uppercase outline-none"
                          placeholder="MHK..."
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Nomor Mesin (Engine)</label>
                        <input 
                          type="text" 
                          value={formData.engineNumber || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, engineNumber: e.target.value }))}
                          className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg py-2 px-3 text-xs font-mono uppercase outline-none"
                          placeholder="2GD..."
                        />
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-3.5">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <span className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <Users size={12} className="text-blue-500" />
                          Informasi Pemilik (Customer)
                        </span>
                        
                        <div className="flex bg-slate-200/60 p-0.5 rounded-lg text-[9px] font-bold">
                          <button
                            type="button"
                            onClick={() => setIsCreatingNewCustomerInVehicleForm(false)}
                            className={`px-2 py-1 rounded-md transition-all ${!isCreatingNewCustomerInVehicleForm ? 'bg-white text-blue-700 font-extrabold shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                          >
                            Pilih Terdaftar
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsCreatingNewCustomerInVehicleForm(true);
                              setFormData(prev => ({ ...prev, customerId: '' }));
                            }}
                            className={`px-2 py-1 rounded-md transition-all ${isCreatingNewCustomerInVehicleForm ? 'bg-white text-blue-700 font-extrabold shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                          >
                            + Customer Baru
                          </button>
                        </div>
                      </div>

                      {!isCreatingNewCustomerInVehicleForm ? (
                        <div className="space-y-2">
                          <label className="text-[10px] font-extrabold text-slate-500 uppercase block">Pilih Pemilik Pelanggan <span className="text-red-500">*</span></label>
                          <select 
                            required={!isCreatingNewCustomerInVehicleForm}
                            value={formData.customerId || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, customerId: e.target.value }))}
                            className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-xs font-semibold outline-none focus:border-blue-500"
                          >
                            <option value="">-- Hubungkan Owner / Pelanggan --</option>
                            {customers.map((cust) => (
                              <option key={cust.id} value={cust.id}>
                                {cust.name} ({cust.phone || 'No Phone'}) — {cust.bpCategory || 'Retail'}
                              </option>
                            ))}
                          </select>
                          <p className="text-[9px] text-slate-400 font-medium italic">
                            💡 Tips: Jika pelanggan belum terdaftar, klik tab "+ Customer Baru" di atas untuk mendaftarkannya secara instan.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3 bg-white p-3 rounded-lg border border-slate-200/60">
                          <div className="border-l-2 border-blue-500 pl-2 py-0.5 mb-1 bg-blue-50/40 rounded-r">
                            <p className="text-[10px] font-extrabold text-blue-800 uppercase tracking-tight">Quick Customer Registration</p>
                            <p className="text-[9px] text-slate-500">Mendaftar customer & menghubungkan kendaraan ini secara otomatis.</p>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Nama Pelanggan <span className="text-red-500">*</span></label>
                              <input 
                                type="text" 
                                required={isCreatingNewCustomerInVehicleForm}
                                value={formData.newCustName || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, newCustName: e.target.value }))}
                                className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg py-2 px-3 text-xs font-semibold outline-none transition-all"
                                placeholder="Nama lengkap..."
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">No. Telefon / WA <span className="text-red-500">*</span></label>
                              <input 
                                type="text" 
                                required={isCreatingNewCustomerInVehicleForm}
                                value={formData.newCustPhone || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, newCustPhone: e.target.value }))}
                                className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg py-2 px-3 text-xs font-mono font-bold outline-none transition-all"
                                placeholder="e.g. 0812..."
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Kategori Pelanggan <span className="text-red-500">*</span></label>
                            <select 
                              value={formData.newCustBpCategory || 'Retail'}
                              onChange={(e) => setFormData(prev => ({ ...prev, newCustBpCategory: e.target.value }))}
                              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg py-1.5 px-2.5 text-xs font-bold outline-none cursor-pointer"
                            >
                              <option value="Retail">Retail / Perorangan</option>
                              <option value="Corporate">Corporate / Fleet (Perusahaan)</option>
                              <option value="Government">Government / Instansi Pemerintah</option>
                              <option value="Employee">Employee / Internal Karyawan</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeMenu === 'branch' && (
                  <div className="space-y-3.5">
                    <div>
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Nama Cabang / Workshop <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        required
                        value={formData.name || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg py-2 px-3 text-xs font-bold outline-none uppercase"
                        placeholder="AUTO SYNC - BEKASI UTARA"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">No. Telefon Cabang <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        required
                        value={formData.phone || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg py-2 px-3 text-xs font-mono outline-none"
                        placeholder="021-..."
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Alamat Lengkap Cabang <span className="text-red-500">*</span></label>
                      <textarea 
                        rows={3}
                        required
                        value={formData.address || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg py-2 px-3 text-xs outline-none"
                        placeholder="Alamat aspal, no jalan dsb..."
                      />
                    </div>
                  </div>
                )}

                {activeMenu === 'service' && (
                  <div className="space-y-3.5">
                    <div>
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Nama Jasa / Pekerjaan <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        required
                        value={formData.name || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg py-2 px-3 text-xs font-semibold outline-none"
                        placeholder="e.g. Overhaul Engine Fortuner"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Kategori Jasa</label>
                        <select 
                          value={formData.category || 'engine'}
                          onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs font-bold outline-none"
                        >
                          <option value="engine">Engine / Mesin</option>
                          <option value="brake">Brake / Kemudi / Rem</option>
                          <option value="electrical">Electrical / Aki</option>
                          <option value="body">Body repair / Cat</option>
                          <option value="tuning">Tuning / Servis Ringan</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Tarif Standar ($) <span className="text-red-500">*</span></label>
                        <input 
                          type="number" 
                          step="0.01"
                          required
                          value={formData.standardPrice !== undefined ? formData.standardPrice : 0}
                          onChange={(e) => setFormData(prev => ({ ...prev, standardPrice: parseFloat(e.target.value) || 0 }))}
                          className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg py-2 px-3 text-xs font-black outline-none font-mono"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Modal Footer Controls */}
                <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-100">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 uppercase font-mono transition-all text-center cursor-pointer"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    className="bg-slate-900 hover:bg-blue-600 text-white py-2.5 rounded-xl text-xs font-bold uppercase transition-all shadow-sm text-center cursor-pointer"
                  >
                    Simpan Data
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MasterDataView;
