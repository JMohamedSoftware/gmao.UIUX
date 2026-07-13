const fs = require('fs');

function fixGmaoContext() {
  let content = fs.readFileSync('src/context/GmaoContext.tsx', 'utf-8');

  if (!content.includes("import { AppRole, AppModule, DataScope, RoleDefinition, DEFAULT_ROLE_PERMISSIONS }")) {
    content = content.replace(
      /import \{ createContext, useContext, useState, useEffect \} from 'react';/,
      "import { createContext, useContext, useState, useEffect } from 'react';\nimport { AppRole, AppModule, DataScope, RoleDefinition, DEFAULT_ROLE_PERMISSIONS } from '../config/permissions';"
    );
  }

  if (!content.includes('rolePermissions: Record<AppRole, RoleDefinition>')) {
    content = content.replace(
      /  selectedCampaign: string;/,
      `  selectedCampaign: string;\n  rolePermissions: Record<AppRole, RoleDefinition>;\n  updateRolePermission: (role: AppRole, module: AppModule, action: string, scope: DataScope, isChecked: boolean) => void;`
    );
  }

  if (!content.includes('const [rolePermissions, setRolePermissions]')) {
    const providerStateAddition = `
  const [rolePermissions, setRolePermissions] = useState<Record<AppRole, RoleDefinition>>(DEFAULT_ROLE_PERMISSIONS);

  const updateRolePermission = (role: AppRole, moduleName: AppModule, action: string, scope: DataScope, isChecked: boolean) => {
    setRolePermissions(prev => {
      const newPerms = { ...prev };
      if (!newPerms[role]) newPerms[role] = {};
      const roleDef = newPerms[role];
      if (!roleDef[moduleName]) roleDef[moduleName] = { actions: [], scope: 'mes_donnees' };
      
      const mod = roleDef[moduleName];
      // Update scope
      mod.scope = scope;
      
      // Update actions
      const hasAction = mod.actions.includes(action);
      if (isChecked && !hasAction) {
        mod.actions = [...mod.actions, action];
      } else if (!isChecked && hasAction) {
        mod.actions = mod.actions.filter(a => a !== action);
      }
      
      return newPerms;
    });
  };
`;
    content = content.replace(
      /  const \[selectedCampaign, setSelectedCampaign\] = useState<string>\(mockCampaigns\[0\]\.id\);/,
      `  const [selectedCampaign, setSelectedCampaign] = useState<string>(mockCampaigns[0].id);\n${providerStateAddition}`
    );
  }

  if (!content.includes('updateRolePermission,')) {
    content = content.replace(
      /      selectedCampaign,/,
      `      selectedCampaign,\n      rolePermissions,\n      updateRolePermission,`
    );
  }

  fs.writeFileSync('src/context/GmaoContext.tsx', content);
}

function fixAdmin() {
  let content = fs.readFileSync('src/pages/Admin.tsx', 'utf-8');
  content = content.replace(
    /const \{\s*currentUser,\s*users,\s*addUser,\s*deleteUser,\s*updateUserStatus,\s*updateUser,\s*rolePermissions,\s*updateRolePermission\s*\} = useGmao\(\);/,
    "const { technicians, currentUser, darkMode, toggleDarkMode, tenants, currentTenantId, addUser, rolePermissions, updateRolePermission } = useGmao();"
  );
  fs.writeFileSync('src/pages/Admin.tsx', content);
}

function fixDashboard() {
  let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');
  content = content.replace(/'fournisseurs'/g, "'suppliers'");
  content = content.replace(/'rapports'/g, "'reports'");
  content = content.replace(/'preventif'/g, "'preventive'");
  content = content.replace(/'ot'/g, "'workorders'");
  content = content.replace(/'incidents'/g, "'corrective'");
  content = content.replace(/'stock'/g, "'inventory'");
  content = content.replace(/'equipements'/g, "'equipment'");
  fs.writeFileSync('src/pages/Dashboard.tsx', content);
}

function fixPreventive() {
  let content = fs.readFileSync('src/pages/Preventive.tsx', 'utf-8');
  content = content.replace(/'preventif'/g, "'preventive'");
  fs.writeFileSync('src/pages/Preventive.tsx', content);
}

fixGmaoContext();
fixAdmin();
fixDashboard();
fixPreventive();

console.log("Fixes applied successfully.");
