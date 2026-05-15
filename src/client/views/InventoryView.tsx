import React, { useState, useEffect, useMemo } from 'react';
import { 
  Package, 
  Plus, 
  ArrowRightLeft, 
  Search, 
  Filter, 
  MapPin, 
  ChevronRight, 
  Droplets, 
  Settings, 
  Cpu, 
  Battery, 
  Disc,
  PackageX,
  X,
  History,
  TrendingDown,
  TrendingUp,
  Settings2,
  Bell,
  AlertTriangle,
  Info
} from 'lucide-react';

const InventoryView: React.FC = () => {
  const [inventory, setInventory] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [moveType, setMoveType] = useState('in');
  const [actionItem, setActionItem] = useState<any>(null);

  const [moveForm, setMoveForm] = useState({
    inventoryId: '',
    quantity: 0,
    note: ''
  });

  const [transferForm, setTransferForm] = useState({
    fromInventoryId: '',
    toBranchId: '',
    toWarehouseId: '',
    quantity: 0,
    note: ''
  });

  const [targetWarehouses, setTargetWarehouses] = useState<any[]>([]);

  const unreadCount = useMemo(() => notifications.filter(n => !n.isRead).length, [notifications]);

  const lowStockCount = useMemo(() => 
    inventory.filter(i => (i.quantity - i.reserved) <= i.minStock).length,
    [inventory]
  );

  const totalReserved = useMemo(() => 
    inventory.reduce((s, i) => s + i.reserved, 0),
    [inventory]
  );

  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      const matchesWarehouse = !selectedWarehouseId || item.warehouseId === selectedWarehouseId;
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || 
          item.part.name.toLowerCase().includes(q) || 
          item.part.code.toLowerCase().includes(q) ||
          item.zone?.toLowerCase().includes(q) ||
          item.rack?.toLowerCase().includes(q) ||
          item.bin?.toLowerCase().includes(q);
          
      return matchesWarehouse && matchesSearch;
    });
  }, [inventory, selectedWarehouseId, searchQuery]);

  const fetchInventoryData = async () => {
    try {
      const [invRes, whRes, notiRes, branchRes] = await Promise.all([
        fetch('/api/inventory'),
        fetch('/api/inventory/warehouses'),
        fetch('/api/inventory/notifications'),
        fetch('/api/inventory/branches')
      ]);
      if (invRes.ok) setInventory(await invRes.json());
      if (whRes.ok) setWarehouses(await whRes.json());
      if (notiRes.ok) setNotifications(await notiRes.json());
      if (branchRes.ok) setBranches(await branchRes.json());
    } catch (err) {
      console.error("Inventory: Failed to fetch data", err);
    }
  };

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const handleBranchChange = async (branchId: string) => {
    setTransferForm(prev => ({ ...prev, toBranchId: branchId, toWarehouseId: '' }));
    if (!branchId) {
      setTargetWarehouses([]);
      return;
    }
    
    try {
      const res = await fetch(`/api/inventory/warehouses?branchId=${branchId}`);
      if (res.ok) {
        setTargetWarehouses(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch warehouses for branch", err);
    }
  };

  const openTransferModal = (item: any = null) => {
    setActionItem(item);
    const initialForm = {
      fromInventoryId: item ? item.id : '',
      toBranchId: item ? item.branchId : '',
      toWarehouseId: '',
      quantity: 0,
      note: ''
    };
    setTransferForm(initialForm);
    if (initialForm.toBranchId) {
      handleBranchChange(initialForm.toBranchId);
    }
    setIsTransferModalOpen(true);
  };

  const submitTransfer = async () => {
    if (!transferForm.toWarehouseId || transferForm.quantity <= 0) return;
    
    try {
      const res = await fetch('/api/inventory/transfer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(transferForm)
      });
      
      if (res.ok) {
          setIsTransferModalOpen(false);
          setSelectedItem(null);
          await fetchInventoryData();
      } else {
          const errData = await res.json();
          alert(errData.message || "Transfer failed");
      }
    } catch (err) {
      console.error("Transfer error", err);
    }
  };

  const handleNotificationClick = async (n: any) => {
    if (!n.isRead) {
        try {
            await fetch(`/api/inventory/notifications/${n.id}/read`, { method: 'PATCH' });
            setNotifications(prev => prev.map(notif => notif.id === n.id ? { ...notif, isRead: true } : notif));
        } catch (err) {
            console.error("Failed to mark read", err);
        }
    }
    
    if (n.category === 'inventory' && n.referenceId) {
        const item = inventory.find(i => i.id === n.referenceId);
        if (item) {
            setSelectedItem(item);
            setIsNotificationsOpen(false);
        }
    }
  };

  const openMoveModal = (type: string, item: any = null) => {
    setMoveType(type);
    setActionItem(item);
    setMoveForm({
        inventoryId: item ? item.id : '',
        quantity: type === 'adjustment' && item ? item.quantity : 0,
        note: ''
    });
    setIsMoveModalOpen(true);
  };

  const submitMovement = async () => {
    try {
      const res = await fetch('/api/inventory/movements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              ...moveForm,
              type: moveType
          })
      });
      if (res.ok) {
          setIsMoveModalOpen(false);
          await fetchInventoryData();
          if (selectedItem) {
              const updated = inventory.find(i => i.id === selectedItem.id);
              if (updated) setSelectedItem(updated);
          }
      }
    } catch (err) {
      console.error("Inventory: Update failed", err);
    }
  };

  const getIcon = (category: string) => {
    switch (category?.toLowerCase()) {
        case 'oil': return Droplets;
        case 'filter': return Settings;
        case 'engine': return Cpu;
        case 'battery': return Battery;
        case 'brake': return Disc;
        default: return Package;
    }
  };

  const getMoveIcon = (type: string) => {
    switch (type) {
        case 'in': return TrendingUp;
        case 'out': return TrendingDown;
        case 'reservation': return Package;
        case 'release': return ArrowRightLeft;
        default: return Settings2;
    }
  };

  const getMoveColor = (type: string) => {
    switch (type) {
        case 'in': return 'bg-emerald-50 text-emerald-600';
        case 'out': return 'bg-red-50 text-red-600';
        case 'reservation': return 'bg-amber-50 text-amber-600';
        case 'release': return 'bg-blue-50 text-blue-600';
        default: return 'bg-slate-50 text-slate-500';
    }
  };

  const getAvailableClass = (item: any) => {
    const avail = item.quantity - item.reserved;
    if (avail <= 0) return 'text-red-600 underline decoration-red-200 decoration-4';
    if (avail <= item.minStock) return 'text-amber-600';
    return 'text-blue-600';
  };

  const isLowStock = (item: any) => {
    return (item.quantity - item.reserved) <= item.minStock;
  };

  const formatDateShort = (date: any) => {
    return new Date(date).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="p-8 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <Package className="text-blue-600" size={32} />
            Inventory Tracking
          </h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
            Real-time Stock Movement & Physical Location Control
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <button 
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} 
              className="bg-white border border-slate-200 p-2.5 rounded-xl text-slate-500 hover:bg-slate-50 transition-all shadow-sm relative"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-3 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 z-[70] overflow-hidden">
                <div className="p-5 border-b border-slate-50 flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Alerts & Notifications</h4>
                  <button onClick={() => setIsNotificationsOpen(false)} className="text-slate-400 hover:text-slate-800">
                    <X size={16} />
                  </button>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} onClick={() => handleNotificationClick(n)} className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-all cursor-pointer ${n.isRead ? 'opacity-60' : 'bg-blue-50/30'}`}>
                      <div className="flex gap-3">
                        <div className={`w-8 h-8 shrink-0 rounded-xl flex items-center justify-center ${n.type === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                          {n.type === 'warning' ? <AlertTriangle size={16} /> : <Info size={16} />}
                        </div>
                        <div>
                          <p className="text-[11px] font-black text-slate-800 leading-tight">{n.title}</p>
                          <p className="text-[10px] font-medium text-slate-500 mt-1 leading-snug">{n.message}</p>
                          <p className="text-[8px] font-black text-slate-400 uppercase mt-2 tracking-widest">{formatDateShort(n.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {notifications.length === 0 && (
                    <div className="p-12 text-center">
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No notifications</p>
                    </div>
                  )}
                </div>
                <div className="p-3 bg-slate-50 text-center">
                  <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Clear All</button>
                </div>
              </div>
            )}
          </div>

          <button onClick={() => openMoveModal('in')} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2">
            <Plus size={16} /> Stock In
          </button>
          <button onClick={() => openTransferModal()} className="bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2">
            <ArrowRightLeft size={16} /> Transfer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Health Status</p>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Low Stock</span>
                <span className="px-2 py-1 bg-red-50 text-red-600 text-[10px] font-black rounded-lg">{lowStockCount} ITEMS</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Reserved</span>
                <span className="px-2 py-1 bg-amber-50 text-amber-600 text-[10px] font-black rounded-lg">{totalReserved} UNITS</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Consignment</span>
                <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-lg">8 ITEMS</span>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-900 p-5 rounded-3xl shadow-xl">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Current Warehouse</p>
            <select 
              value={selectedWarehouseId}
              onChange={(e) => setSelectedWarehouseId(e.target.value)}
              className="w-full bg-slate-800 border-none text-white text-sm font-black rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
            >
              <option value="">All Warehouses</option>
              {warehouses.map((wh: any) => (
                <option key={wh.id} value={wh.id}>{wh.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex gap-4">
              <div className="relative flex-1 group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                  <input 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      type="text" 
                      placeholder="Search Part Name, Code, Barcode, or Position..." 
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                  />
              </div>
              <div className="flex items-center gap-2">
                  <button className="bg-slate-50 p-3 rounded-2xl text-slate-500 hover:bg-slate-100 transition-colors">
                      <Filter size={20} />
                  </button>
              </div>
            </div>

            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <tr>
                          <th className="px-6 py-4">Item Details</th>
                          <th className="px-6 py-4">Physical Position</th>
                          <th className="px-6 py-4 text-center">In Stock</th>
                          <th className="px-6 py-4 text-center">Reserved</th>
                          <th className="px-6 py-4 text-center">Available</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                      {filteredInventory.map((item) => {
                        const Icon = getIcon(item.part.category);
                        return (
                          <tr key={item.id} className="group hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setSelectedItem(item)}>
                              <td className="px-6 py-5">
                                  <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                          <Icon size={20} />
                                      </div>
                                      <div>
                                          <p className="text-sm font-black text-slate-800 tracking-tight">{item.part.name}</p>
                                          <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-tighter">{item.part.code}</p>
                                      </div>
                                  </div>
                              </td>
                              <td className="px-6 py-5">
                                  <div className="flex flex-col gap-1">
                                      <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-700 uppercase tracking-wider">
                                          <MapPin size={10} className="text-blue-500" />
                                          {item.zone} / {item.rack}
                                      </div>
                                      <div className="text-[9px] font-bold text-slate-400 uppercase ml-4">
                                          S:{item.shelf} BIN:{item.bin}
                                      </div>
                                  </div>
                              </td>
                              <td className="px-6 py-5 text-center">
                                  <span className="text-sm font-black text-slate-700">{item.quantity}</span>
                                  <span className="text-[9px] font-bold text-slate-400 ml-1 uppercase">{item.part.unit}</span>
                              </td>
                              <td className="px-6 py-5 text-center">
                                  <span className={`text-sm font-black ${item.reserved > 0 ? 'text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg' : 'text-slate-400'}`}>
                                      {item.reserved}
                                  </span>
                              </td>
                              <td className="px-6 py-5 text-center">
                                  <div className="flex flex-col items-center">
                                      <span className={`text-lg font-black tracking-tighter ${getAvailableClass(item)}`}>
                                          {item.quantity - item.reserved}
                                      </span>
                                      {isLowStock(item) && <span className="text-[8px] font-black text-red-500 uppercase tracking-widest mt-[-2px]">LOW STOCK</span>}
                                  </div>
                              </td>
                              <td className="px-6 py-5 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                      <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                                          <History size={18} />
                                      </button>
                                      <button className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all">
                                          <ChevronRight size={18} />
                                      </button>
                                  </div>
                              </td>
                          </tr>
                        );
                      })}
                      {filteredInventory.length === 0 && (
                          <tr>
                              <td colSpan={6} className="px-6 py-20 text-center">
                                  <div className="flex flex-col items-center gap-3">
                                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                                          <PackageX size={32} />
                                      </div>
                                      <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No matching items found</p>
                                  </div>
                              </td>
                          </tr>
                      )}
                  </tbody>
              </table>
            </div>
        </div>
      </div>

      {/* Detail Side Drawer */}
      {selectedItem && (
        <div className="fixed inset-y-0 right-0 w-full lg:w-[480px] bg-white shadow-2xl z-50 border-l border-slate-200 flex flex-col transition-transform">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 truncate">
                    <button onClick={() => setSelectedItem(null)} className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all">
                        <X size={20} />
                    </button>
                    <div className="truncate">
                        <h3 className="font-black text-slate-800 truncate">{selectedItem.part.name}</h3>
                        <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Stock Item Details</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider border ${selectedItem.part.isConsignment ? 'bg-indigo-50 text-indigo-600' : 'bg-blue-50 text-blue-600'}`}>
                        {selectedItem.part.isConsignment ? 'Consignment' : 'Standard'}
                    </span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">On Hand</p>
                        <p className="text-xl font-black text-slate-800 tracking-tighter">{selectedItem.quantity}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Reserved</p>
                        <p className="text-xl font-black text-amber-600 tracking-tighter">{selectedItem.reserved}</p>
                    </div>
                    <div className="bg-blue-600 p-4 rounded-2xl shadow-lg shadow-blue-600/20 text-center">
                        <p className="text-[9px] font-black text-blue-200 uppercase tracking-widest mb-1">Available</p>
                        <p className="text-xl font-black text-white tracking-tighter">{selectedItem.quantity - selectedItem.reserved}</p>
                    </div>
                </div>

                <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <MapPin size={12} /> Physical Storage Location
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1 p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-[8px] font-black text-slate-400 uppercase">Warehouse</span>
                            <span className="text-xs font-bold text-slate-700">{selectedItem.warehouse?.name}</span>
                        </div>
                        <div className="flex flex-col gap-1 p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-[8px] font-black text-slate-400 uppercase">Zone</span>
                            <span className="text-xs font-bold text-slate-700">{selectedItem.zone}</span>
                        </div>
                        <div className="flex flex-col gap-1 p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-[8px] font-black text-slate-400 uppercase">Rack & Shelf</span>
                            <span className="text-xs font-bold text-slate-700">{selectedItem.rack} - {selectedItem.shelf}</span>
                        </div>
                        <div className="flex flex-col gap-1 p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-[8px] font-black text-slate-400 uppercase">Bin Code</span>
                            <span className="text-xs font-bold text-slate-700 font-mono tracking-tight">{selectedItem.bin}</span>
                        </div>
                    </div>
                </div>

                <div>
                   <div className="flex items-center justify-between mb-4">
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                           <History size={12} /> Movement History
                       </h4>
                       <button className="text-[9px] font-black text-blue-600 uppercase hover:underline">View All</button>
                   </div>
                   <div className="space-y-3">
                       {selectedItem.movements?.slice(0, 5).map((mv: any) => {
                         const MvIcon = getMoveIcon(mv.type);
                         return (
                          <div key={mv.id} className="flex gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group">
                              <div className={`w-8 h-8 shrink-0 rounded-xl flex items-center justify-center ${getMoveColor(mv.type)}`}>
                                  <MvIcon size={14} />
                              </div>
                              <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                      <p className="text-xs font-black text-slate-700 uppercase tracking-tight">{mv.type}</p>
                                      <p className={`text-[10px] font-black tracking-tighter ${mv.quantity >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                          {mv.quantity > 0 ? '+' : ''}{mv.quantity} {selectedItem.part.unit}
                                      </p>
                                  </div>
                                  <div className="flex items-center justify-between mt-0.5">
                                      <p className="text-[10px] font-bold text-slate-400 uppercase">{formatDateShort(mv.createdAt)}</p>
                                      <p className="text-[10px] font-bold text-slate-400 italic">{mv.referenceType || 'Manual'}</p>
                                  </div>
                              </div>
                          </div>
                         );
                       })}
                   </div>
                </div>
            </div>

             <div className="p-6 border-t border-slate-100 bg-slate-50/50 grid grid-cols-2 gap-4">
                 <button onClick={() => openMoveModal('adjustment', selectedItem)} className="flex flex-col items-center gap-1 p-3 bg-white border border-slate-200 rounded-2xl hover:border-blue-500 hover:text-blue-600 transition-all group">
                     <Settings2 size={20} className="text-slate-400 group-hover:text-blue-600" />
                     <span className="text-[9px] font-black uppercase tracking-widest">Adjust Stock</span>
                 </button>
                 <button onClick={() => openTransferModal(selectedItem)} className="flex flex-col items-center gap-1 p-3 bg-white border border-slate-200 rounded-2xl hover:border-blue-500 hover:text-blue-600 transition-all group">
                     <ArrowRightLeft size={20} className="text-slate-400 group-hover:text-blue-600" />
                     <span className="text-[9px] font-black uppercase tracking-widest">Transfer to...</span>
                 </button>
             </div>
        </div>
      )}

      {/* Movement Modal */}
      {isMoveModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsMoveModalOpen(false)}></div>
            <div className="bg-white w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl relative">
                <div className="p-8 border-b border-slate-100">
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight uppercase">{moveType} Stock</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Manual Inventory Intervention</p>
                </div>
                
                <div className="p-8 space-y-6">
                    {!actionItem && (
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Select Item</label>
                            <select 
                              value={moveForm.inventoryId}
                              onChange={(e) => setMoveForm(prev => ({ ...prev, inventoryId: e.target.value }))}
                              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-4 text-sm font-black outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                            >
                                <option value="">Select an Item...</option>
                                {inventory.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.part.name} ({item.part.code})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">{moveType === 'adjustment' ? 'Actual Physical Count' : 'Quantity'}</label>
                        <div className="flex items-center gap-4">
                            <input 
                                value={moveForm.quantity}
                                onChange={(e) => setMoveForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                                type="number" 
                                className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-4 text-sm font-black outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                            />
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-4 py-3.5 rounded-2xl">
                                {actionItem?.part?.unit || 'PCS'}
                            </span>
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Note / Reason</label>
                        <textarea 
                            value={moveForm.note}
                            onChange={(e) => setMoveForm(prev => ({ ...prev, note: e.target.value }))}
                            placeholder="Why are you changing this stock?" 
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-4 text-sm font-black outline-none focus:ring-4 focus:ring-blue-500/10 transition-all h-24 resize-none"
                        ></textarea>
                    </div>
                </div>

                <div className="p-8 bg-slate-50 flex gap-3">
                    <button onClick={() => setIsMoveModalOpen(false)} className="flex-1 py-4 text-xs font-black text-slate-500 uppercase tracking-widest hover:text-slate-800 transition-colors">Cancel</button>
                    <button onClick={submitMovement} className="flex-1 bg-slate-900 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 active:scale-95 transition-all">
                        Register Movement
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Stock Transfer Modal */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsTransferModalOpen(false)}></div>
            <div className="bg-white w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl relative">
                <div className="p-8 border-b border-slate-100">
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Transfer Stock</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Inter-Branch & Warehouse Movement</p>
                </div>
                
                <div className="p-8 space-y-5">
                    {!actionItem ? (
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Source Item</label>
                            <select 
                              value={transferForm.fromInventoryId}
                              onChange={(e) => setTransferForm(prev => ({ ...prev, fromInventoryId: e.target.value }))}
                              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-4 text-sm font-black outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                            >
                                <option value="">Select Item to Transfer...</option>
                                {inventory.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.part.name} ({item.part.code}) @ {item.branch.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                            <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-1">Transferring</p>
                            <p className="text-sm font-black text-blue-700">{actionItem.part.name}</p>
                            <p className="text-[10px] font-bold text-blue-500 uppercase mt-0.5">FROM: {actionItem.branch.name} / {actionItem.warehouse?.name || 'Main'}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Dest. Branch</label>
                            <select 
                              value={transferForm.toBranchId}
                              onChange={(e) => handleBranchChange(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-4 text-xs font-black outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                            >
                                <option value="">Select Branch...</option>
                                {branches.map((b: any) => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Dest. Warehouse</label>
                            <select 
                              value={transferForm.toWarehouseId}
                              onChange={(e) => setTransferForm(prev => ({ ...prev, toWarehouseId: e.target.value }))}
                              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-4 text-xs font-black outline-none focus:ring-4 focus:ring-blue-500/10 transition-all" 
                              disabled={!transferForm.toBranchId}
                            >
                                <option value="">Select WH...</option>
                                {targetWarehouses.map((w: any) => (
                                    <option key={w.id} value={w.id}>{w.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Transfer Quantity</label>
                        <div className="flex items-center gap-4">
                            <input 
                                value={transferForm.quantity}
                                onChange={(e) => setTransferForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                                type="number" 
                                className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-4 text-sm font-black outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                                placeholder="0"
                            />
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-4 py-3.5 rounded-2xl">
                                 UNITS
                            </span>
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Transfer Note</label>
                        <input 
                            value={transferForm.note}
                            onChange={(e) => setTransferForm(prev => ({ ...prev, note: e.target.value }))}
                            type="text" 
                            placeholder="Purpose of transfer..."
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-4 text-sm font-black outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                        />
                    </div>
                </div>

                <div className="p-8 bg-slate-50 flex gap-3">
                    <button onClick={() => setIsTransferModalOpen(false)} className="flex-1 py-4 text-xs font-black text-slate-500 uppercase tracking-widest hover:text-slate-800 transition-colors">Cancel</button>
                    <button onClick={submitTransfer} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 active:scale-95 transition-all">
                        Confirm Transfer
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default InventoryView;
