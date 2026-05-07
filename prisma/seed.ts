import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding expanded master data...');

  // 1. Branches (Workshops)
  const branches = [
    { id: 'cakung', name: 'Bengkel Cakung', address: 'Jl. Raya Cakung No. 10', phone: '021-111111' },
    { id: 'pulo-gebang', name: 'Bengkel Pulo Gebang', address: 'Jl. Pulo Gebang No. 20', phone: '021-222222' },
    { id: 'caman', name: 'Bengkel Caman', address: 'Jl. Caman No. 30', phone: '021-333333' },
    { id: 'kalimalang', name: 'Bengkel Kalimalang', address: 'Jl. Kalimalang No. 40', phone: '021-444444' },
  ];

  for (const b of branches) {
    await prisma.branch.upsert({
      where: { id: b.id },
      update: {},
      create: b,
    });
  }

  // 2. Vehicle Models
  const models = [
    { name: 'Toyota Fortuner 2.4 VRZ', brand: 'Toyota' },
    { name: 'Honda CR-V 1.5 Turbo', brand: 'Honda' },
    { name: 'Mitsubishi Pajero Sport', brand: 'Mitsubishi' },
    { name: 'BMW 320i', brand: 'BMW' },
  ];

  for (const m of models) {
    await prisma.vehicleModel.upsert({
      where: { name: m.name },
      update: {},
      create: m,
    });
  }

  // 3. Task Master (Labor)
  const tasks = [
    { name: 'Ganti Oli Mesin', category: 'Engine', standardPrice: 75000 },
    { name: 'Tune Up Ringan', category: 'Engine', standardPrice: 250000 },
    { name: 'Service Rem 4 Roda', category: 'Brake', standardPrice: 350000 },
    { name: 'Ganti Aki', category: 'Electrical', standardPrice: 50000 },
    { name: 'General Checkup', category: 'General', standardPrice: 150000 },
  ];

  for (const t of tasks) {
    await prisma.taskMaster.upsert({
      where: { name: t.name },
      update: {},
      create: t,
    });
  }

  // 4. Spare Parts (Master Product)
  const parts = [
    { code: 'SHELL-5W30-1L', name: 'Shell Helix 5W-30', unit: 'Liter', category: 'Oil', basePrice: 165000 },
    { code: 'FIL-O-TYT', name: 'Oil Filter Toyota', unit: 'Pcs', category: 'Filter', basePrice: 85000 },
    { code: 'FIL-A-TYT', name: 'Air Filter Toyota', unit: 'Pcs', category: 'Filter', basePrice: 150000 },
    { code: 'PAD-B-TYT', name: 'Brake Pad Front Fortuner', unit: 'Set', category: 'Brake', basePrice: 850000 },
    { code: 'AKI-GS-65', name: 'GS Astra MF 65Ah', unit: 'Pcs', category: 'Battery', basePrice: 1200000 },
  ];

  const partRecords = [];
  for (const p of parts) {
    const pr = await prisma.sparePart.upsert({
      where: { code: p.code },
      update: {},
      create: p,
    });
    partRecords.push(pr);
  }

  // 4.1 Warehouses & Inventory
  console.log('📦 Seeding Warehouses and Inventory Data...');
  const allBranches = await prisma.branch.findMany();
  for (const b of allBranches) {
    const wh = await prisma.warehouse.create({
      data: {
        name: `Main Warehouse - ${b.name}`,
        branchId: b.id
      }
    });

    for (const p of partRecords) {
        await prisma.inventory.create({
            data: {
                branchId: b.id,
                warehouseId: wh.id,
                partId: p.id,
                quantity: Math.floor(Math.random() * 100) + 10,
                reserved: Math.floor(Math.random() * 5),
                minStock: 10,
                zone: 'ZONE-' + (['A', 'B', 'C'][Math.floor(Math.random() * 3)]),
                rack: 'RACK-' + Math.floor(Math.random() * 10),
                shelf: ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)],
                bin: 'BIN-' + Math.floor(Math.random() * 50)
            }
        });
    }
  }

  // 5. Corporate Customers (Mastering)
  const corporates = [
    { name: 'Astra International', type: 'corporate', phone: '021-999001' },
    { name: 'Pertamina (Persero)', type: 'corporate', phone: '021-999002' },
    { name: 'Bank Mandiri', type: 'corporate', phone: '021-999003' },
  ];

  for (const c of corporates) {
    await prisma.customer.upsert({
      where: { id: `corp-${c.name.toLowerCase().replace(/\s/g, '-')}` },
      update: {},
      create: {
        id: `corp-${c.name.toLowerCase().replace(/\s/g, '-')}`,
        ...c
      }
    });
  }

  // 6. Mechanics
  const mechanics = [
    { email: 'eko@auto.com', name: 'Eko Mechanic', role: 'mechanic' },
    { email: 'budi@auto.com', name: 'Budi Mechanic', role: 'mechanic' },
    { email: 'agus@auto.com', name: 'Agus Mechanic', role: 'mechanic' },
  ];

  for (const m of mechanics) {
    await prisma.user.upsert({
      where: { email: m.email },
      update: {},
      create: {
        ...m,
        password: 'password123', // Demo password
        branchId: 'cakung'
      }
    });
  }

  // 7. Dummy Requisitions (Maintenance Requisition)
  console.log('📦 Creating 10 dummy requisitions...');
  
  const allModels = await prisma.vehicleModel.findMany();
  const allTasks = await prisma.taskMaster.findMany();
  const allParts = await prisma.sparePart.findMany();
  const allCorps = await prisma.customer.findMany({ where: { type: 'corporate' } });

  // 5 Private Requisitions
  const privateCustomers = [
    { id: 'cust-dum-1', name: 'Budi Santoso', phone: '081234567801', plate: 'B 1001 ABC' },
    { id: 'cust-dum-2', name: 'Siti Aminah', phone: '081234567802', plate: 'B 1002 DEF' },
    { id: 'cust-dum-3', name: 'Agus Suharso', phone: '081234567803', plate: 'B 1003 GHI' },
    { id: 'cust-dum-4', name: 'Dewi Lestari', phone: '081234567804', plate: 'B 1004 JKL' },
    { id: 'cust-dum-5', name: 'Eko Prasetyo', phone: '081234567805', plate: 'B 1005 MNO' },
  ];

  for (let i = 0; i < 5; i++) {
    const cust = privateCustomers[i];
    const customer = await prisma.customer.upsert({
      where: { id: cust.id },
      update: {},
      create: { id: cust.id, name: cust.name, phone: cust.phone, type: 'individual' }
    });

    const vehicle = await prisma.vehicle.upsert({
      where: { plateNumber: cust.plate },
      update: {},
      create: {
        plateNumber: cust.plate,
        modelId: allModels[i % allModels.length].id,
        customerId: customer.id
      }
    });

    const spk = `SPK-DUM-P${i+1}`;
    await prisma.order.upsert({
      where: { spkNumber: spk },
      update: {},
      create: {
        spkNumber: spk,
        branchId: allBranches[i % allBranches.length].id,
        customerId: customer.id,
        vehicleId: vehicle.id,
        odometer: 15000 + (i * 2000),
        complaint: 'Routine service and check up',
        analysis: 'Looks standard, needs oil change',
        serviceType: 'walk-in',
        status: 'draft',
        estimatedTotal: 500000,
        items: {
          create: [
            { taskId: allTasks[0].id, quantity: 1, price: allTasks[0].standardPrice, isService: true },
            { partId: allParts[0].id, quantity: 4, price: allParts[0].basePrice, isService: false },
          ]
        }
      }
    });
  }

  // 5 Corporate Requisitions
  for (let i = 0; i < 5; i++) {
    const corp = allCorps[i % allCorps.length];
    const plate = `B 200${i+1} CORP`;
    
    const vehicle = await prisma.vehicle.upsert({
      where: { plateNumber: plate },
      update: {},
      create: {
        plateNumber: plate,
        modelId: allModels[i % allModels.length].id,
        customerId: corp.id
      }
    });

    const spk = `SPK-DUM-C${i+1}`;
    await prisma.order.upsert({
      where: { spkNumber: spk },
      update: {},
      create: {
        spkNumber: spk,
        branchId: allBranches[i % allBranches.length].id,
        customerId: corp.id,
        vehicleId: vehicle.id,
        odometer: 50000 + (i * 5000),
        complaint: 'Company vehicle routine maintenance',
        analysis: 'Heavy usage, check brakes and suspension',
        serviceType: 'walk-in',
        status: 'draft',
        estimatedTotal: 1200000,
        items: {
          create: [
            { taskId: allTasks[1].id, quantity: 1, price: allTasks[1].standardPrice, isService: true },
            { taskId: allTasks[2].id, quantity: 1, price: allTasks[2].standardPrice, isService: true },
            { partId: allParts[3].id, quantity: 1, price: allParts[3].basePrice, isService: false },
          ]
        }
      }
    });
  }

  console.log('✅ Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
