#!/usr/bin/env node

// Simple system test to verify all modules can be imported
console.log('🧪 Testing TasteBot System...\n');

const tests = [
  {
    name: 'Navigation System',
    test: () => {
      const { NavigationRouter } = require('./dist/modules/navigation/navigation-router.service');
      return NavigationRouter !== undefined;
    }
  },
  {
    name: 'LangChain Orchestrator',
    test: () => {
      const { LangChainOrchestrator } = require('./dist/modules/langchain/langchain-orchestrator.service');
      return LangChainOrchestrator !== undefined;
    }
  },
  {
    name: 'Qloo Service',
    test: () => {
      const { QlooService } = require('./dist/modules/qloo/qloo.service');
      return QlooService !== undefined;
    }
  },
  {
    name: 'Memory System',
    test: () => {
      const { MemorySystem } = require('./dist/modules/memory/memory-system.service');
      return MemorySystem !== undefined;
    }
  },
  {
    name: 'Cultural Intelligence',
    test: () => {
      const { CulturalIntelligenceService } = require('./dist/modules/cultural/cultural-intelligence.service');
      return CulturalIntelligenceService !== undefined;
    }
  },
  {
    name: 'Fallback System',
    test: () => {
      const { FallbackSystemService } = require('./dist/modules/error-handling/fallback-system.service');
      return FallbackSystemService !== undefined;
    }
  }
];

let passed = 0;
let failed = 0;

console.log('Running module import tests...\n');

tests.forEach(({ name, test }) => {
  try {
    const result = test();
    if (result) {
      console.log(`✅ ${name}: PASSED`);
      passed++;
    } else {
      console.log(`❌ ${name}: FAILED`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ ${name}: ERROR - ${error.message}`);
    failed++;
  }
});

console.log(`\n📊 Test Results:`);
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);

if (failed === 0) {
  console.log('\n🎉 All systems operational! TasteBot is ready for deployment.');
} else {
  console.log('\n⚠️  Some systems need attention before deployment.');
  process.exit(1);
}