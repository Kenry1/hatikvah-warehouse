// src/lib/demoData.ts\nimport { serverTimestamp } from \"firebase/firestore\";\nimport { User, Company, ITAsset, AssetRequest, LeaveRequest } from \"./firestoreHelpers\";\n\n// --- Demo Company ---\nexport const demoCompany: Omit<Company, \"id\" | \"createdAt\"> = {\n  name: \"Acme Corp\",\n  adminUserId: \"\", // This will be filled after the admin user is created\n};\n\n// --- Demo Users (Employees) ---\nexport const demoUsers: Omit<User, \"id\" | \"createdAt\" | \"updatedAt\" | \"companyId\" | \"companyName\">[] = [\n  {\n    username: \'Admin User\',\n    email: \'admin@acmecorp.com\',\n    role: \'Admin\',\n    phoneNumber: \'+1 (555) 000-0000\',\n    department: \'Management\',\n    position: \'CEO\',\n    manager: \'N/A\',\n    location: \'Headquarters\',\n    startDate: \'2020-01-01\',\n    status: \'active\',\n    avatar: \'/public/placeholder.svg\',\n  },\n  {\n    username: \'Alice Smith\',\n    email: \'alice.s@acmecorp.com\',\
    role: \'Employee\',\n    phoneNumber: \'+1 (555) 111-1111\',\n    department: \'HR\',\n    position: \'HR Associate\',\n    manager: \'Eve Adams\',\
    location: \'New York Office\',\n    startDate: \'2023-01-15\',\n    status: \'active\',\n    avatar: \'/public/placeholder.svg\',\n  },\n  {\n    username: \'Bob Johnson\',\n    email: \'bob.j@acmecorp.com\',\n    role: \'Employee\',\n    phoneNumber: \'+1 (555) 222-2222\',\n    department: \'Finance\',\n    position: \'Financial Assistant\',\n    manager: \'Jack Taylor\',\n    location: \'Chicago Office\',\n    startDate: \'2023-03-20\',\n    status: \'active\',\n    avatar: \'/public/placeholder.svg\',\n  },\n  {\n    username: \'Charlie Brown\',\n    email: \'charlie.b@acmecorp.com\',\n    role: \'ICT\',\n    phoneNumber: \'+1 (555) 333-3333\',\n    department: \'ICT\',\n    position: \'IT Support Specialist\',\n    manager: \'John Smith\',\
    location: \'Los Angeles Office\',\n    startDate: \'2022-05-10\',\n    status: \'active\',\n    avatar: \'/public/placeholder.svg\',\n  },\n  {\n    username: \'Diana Prince\',\n    email: \'diana.p@acmecorp.com\',\n    role: \'Operations Manager\',\n    phoneNumber: \'+1 (555) 444-4444\',\n    department: \'Operations\',\n    position: \'Operations Manager\',\n    manager: \'Jennifer Davis\',\n    location: \'Miami Office\',\n    startDate: \'2022-11-01\',\n    status: \'active\',\n    avatar: \'/public/placeholder.svg\',\n  },\n  {\n    username: \'Eve Adams\',\n    email: \'eve.a@acmecorp.com\',\n    role: \'HR\',\n    phoneNumber: \'+1 (555) 555-5555\',\n    department: \'HR\',\n    position: \'HR Manager\',\n    manager: \'Admin User\',\n    location: \'New York Office\',\n    startDate: \'2021-08-01\',\n    status: \'active\',\n    avatar: \'/public/placeholder.svg\',\n  },\n  {\n    username: \'Frank White\',\n    email: \'frank.w@acmecorp.com\',\n    role: \'Employee\',\n    phoneNumber: \'+1 (555) 666-6666\',\n    department: \'Finance\',\n    position: \'Accountant\',\n    manager: \'Jack Taylor\',\n    location: \'Chicago Office\',\n    startDate: \'2023-02-01\',\n    status: \'active\',\n    avatar: \'/public/placeholder.svg\',\n  },\n  {\n    username: \'Grace Lee\',\n    email: \'grace.l@acmecorp.com\',\n    role: \'Employee\',\n    phoneNumber: \'+1 (555) 777-7777\',\n    department: \'ICT\',\n    position: \'Network Engineer\',\n    manager: \'John Smith\',\n    location: \'Los Angeles Office\',\n    startDate: \'2022-07-01\',\n    status: \'on-leave\',\n    avatar: \'/public/placeholder.svg\',\n    leaveStatus: {\n      type: \'Annual Leave\',\n      startDate: \'2024-07-20\',\n      endDate: \'2024-07-25\'\n    }\n  },\n  {\n    username: \'Henry Miller\',\n    email: \'henry.m@acmecorp.com\',\n    role: \'Logistics\',\n    phoneNumber: \'+1 (555) 888-8888\',\n    department: \'Logistics\',\n    position: \'Logistics Manager\',\n    manager: \'Admin User\',\n    location: \'Miami Office\',\n    startDate: \'2021-09-15\',\n    status: \'active\',\n    avatar: \'/public/placeholder.svg\',\n  },\n  {\n    username: \'Ivy Wilson\',\n    email: \'ivy.w@acmecorp.com\',\n    role: \'Employee\',\n    phoneNumber: \'+1 (555) 999-9999\',\n    department: \'Operations\',\n    position: \'Operations Coordinator\',\n    manager: \'Diana Prince\',\n    location: \'Miami Office\',\n    startDate: \'2023-04-01\',\n    status: \'active\',\n    avatar: \'/public/placeholder.svg\',\n  },\n  {\n    username: \'Jack Taylor\',\n    email: \'jack.t@acmecorp.com\',\n    role: \'Finance\',\n    phoneNumber: \'+1 (555) 000-1111\',\n    department: \'Finance\',\n    position: \'Finance Manager\',\n    manager: \'Admin User\',\n    location: \'Chicago Office\',\n    startDate: \'2021-03-01\',\n    status: \'active\',\n    avatar: \'/public/placeholder.svg\',\n  },\n  {\n    username: \'John Smith\',\n    email: \'john.smith@acmecorp.com\',\
    phone: \'+1 (555) 123-4567\',\
    department: \'ICT\',\
    position: \'Senior Developer\',\
    manager: \'Alice Johnson\',\
    location: \'New York Office\',\
    startDate: \'2022-03-15\',\
    status: \'active\'\n  },\n  {\n    username: \'Sarah Johnson\',\
    email: \'sarah.johnson@acmecorp.com\',\
    phone: \'+1 (555) 234-5678\',\
    department: \'Finance\',\
    position: \'Financial Analyst\',\
    manager: \'Michael Brown\',\
    location: \'Chicago Office\',\
    startDate: \'2021-08-20\',\
    status: \'on-leave\',\
    leaveStatus: {\n      type: \'Annual Leave\',\
      startDate: \'2024-07-20\',\
      endDate: \'2024-07-25\'\n    }\n  },\n  {\n    username: \'Mike Wilson\',\
    email: \'mike.wilson@acmecorp.com\',\
    phone: \'+1 (555) 345-6789\',\
    department: \'Operations\',\
    position: \'Operations Manager\',\
    manager: \'Jennifer Davis\',\
    location: \'Los Angeles Office\',\
    startDate: \'2020-11-10\',\
    status: \'active\'\n  },\n  {\n    username: \'Emily Chen\',\
    email: \'emily.chen@acmecorp.com\',\
    phone: \'+1 (555) 456-7890\',\
    department: \'HR\',\
    position: \'HR Specialist\',\
    manager: \'Robert Wilson\',\
    location: \'New York Office\',\
    startDate: \'2023-01-12\',\
    status: \'active\'\n  },\n  {\n    username: \'David Martinez\',\
    email: \'david.martinez@acmecorp.com\',\
    phone: \'+1 (555) 567-8901\',\
    department: \'Logistics\',\
    position: \'Logistics Coordinator\',\
    manager: \'Lisa Anderson\',\
    location: \'Miami Office\',\
    startDate: \'2022-09-05\',\
    status: \'on-leave\',\
    leaveStatus: {\n      type: \'Sick Leave\',\
      startDate: \'2024-07-18\',\
      endDate: \'2024-07-22\'\n    }\n  }\n];\n\n// --- Demo ITAssets ---\nexport const demoITAssets: Omit<ITAsset, \"id\" | \"createdAt\" | \"updatedAt\" | \"companyId\">[] = [\n  {\n    name: \'Dell Latitude 7420\',\n    type: \'Laptop\',\n    serialNumber: \'SN-LPT-98765\',\n    status: \'Issued\',\n    location: \'Office A, Desk 101\',\n    assignedTo: \'Alice Johnson\',\n    purchaseDate: \'2023-01-15\',\n    warrantyEndDate: \'2026-01-15\',\n  },\n  {\n    name: \'HP EliteDesk 800 G6\',\n    type: \'Desktop\',\n    serialNumber: \'SN-DST-54321\',\n    status: \'In Stock\',\n    location: \'Warehouse, IT Section\',\n    purchaseDate: \'2023-03-20\',\n  },\n  {\n    name: \'LG UltraFine 4K\',\n    type: \'Monitor\',\n    serialNumber: \'SN-MON-11223\',\n    status: \'Issued\',\n    location: \'Office B, Desk 205\',\n    assignedTo: \'Bob Williams\',\n    purchaseDate: \'2023-02-10\',\n  },\n  {\n    name: \'Cisco Catalyst 9300\',\n    type: \'Network Device\',\n    serialNumber: \'SN-NET-45678\',\n    status: \'In Stock\',\n    location: \'Server Room, Rack 3\',\n    purchaseDate: \'2022-11-01\',\n    warrantyEndDate: \'2025-11-01\',\n  },\n  {\n    name: \'iPhone 13 Pro\',\n    type: \'Mobile Device\',\n    serialNumber: \'SN-MOB-12345\',\n    status: \'Under Maintenance\',\n    location: \'IT Repair Shop\',\n    assignedTo: \'Charlie Brown\',\n    purchaseDate: \'2023-05-10\',\n  },\n];\n\n// --- Demo AssetRequests ---\nexport const demoAssetRequests: Omit<AssetRequest, \"id\" | \"requestDate\" | \"createdAt\" | \"updatedAt\" | \"companyId\">[] = [\n  {\n    assetId: \'ASSET-002\',\n    assetName: \'HP EliteDesk 800 G6\',\n    requestType: \'Issuance\',\n    requester: \'Diana Prince\',\n    status: \'Pending\',\n    description: \'New hire setup\',\n  },\n  {\n    assetId: \'ASSET-001\',\n    assetName: \'Dell Latitude 7420\',\n    requestType: \'Collection\',\n    requester: \'Alice Johnson\',\n    status: \'Completed\',\n    description: \'Employee offboarding\',\n  },\n];\n\n// --- Demo LeaveRequests ---\nexport const demoLeaveRequests: Omit<LeaveRequest, \"id\" | \"appliedDate\" | \"createdAt\" | \"updatedAt\" | \"employeeId\" | \"companyId\">[] = [\n  {\n    employeeName: \'John Smith\',\n    department: \'ICT\',\n    leaveType: \'Annual Leave\',\n    startDate: \'2024-08-15\',\n    endDate: \'2024-08-20\',\n    days: 5,\n    reason: \'Family vacation\',\n    status: \'pending\',\n  },\n  {\n    employeeName: \'Sarah Johnson\',\n    department: \'Finance\',\n    leaveType: \'Sick Leave\',\n    startDate: \'2024-07-25\',\
    endDate: \'2024-07-26\',\
    days: 2,\
    reason: \'Medical appointment\',\
    status: \'approved\',\
  },\n  {\n    employeeName: \'Mike Wilson\',\
    department: \'Operations\',\
    leaveType: \'Personal Leave\',\
    startDate: \'2024-09-01\',\
    endDate: \'2024-09-03\',\
    days: 3,\
    reason: \'Personal matters\',\
    status: \'rejected\',\
  }\n];\n