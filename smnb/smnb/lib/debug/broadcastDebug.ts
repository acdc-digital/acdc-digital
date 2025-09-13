/**
 * Quick debug utility to test broadcast session functionality
 */
console.log('🧪 Broadcast Session Debug Utility Loaded');

// Make broadcast session store available globally for testing
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.testBroadcast = {
    start: (type = 'general') => {
      const { useBroadcastSessionStore } = require('./stores/broadcastSessionStore');
      const store = useBroadcastSessionStore.getState();
      store.startBroadcastSession(type);
      console.log('🎙️ Test: Started broadcast session:', type);
    },
    
    end: () => {
      const { useBroadcastSessionStore } = require('./stores/broadcastSessionStore');
      const store = useBroadcastSessionStore.getState();
      store.endBroadcastSession();
      console.log('⏹️ Test: Ended broadcast session');
    },
    
    status: () => {
      const { useBroadcastSessionStore } = require('./stores/broadcastSessionStore');
      const store = useBroadcastSessionStore.getState();
      const { currentSession, sessionHistory } = store;
      
      console.log('📊 Broadcast Session Status:');
      console.log('Current Session:', currentSession);
      console.log('Session History:', sessionHistory);
      console.log('Current Duration:', store.getCurrentSessionDuration());
      console.log('Total Time:', store.getTotalBroadcastTime());
    }
  };
  
  console.log('🎮 Use window.testBroadcast.start(), .end(), .status() to test broadcast sessions');
}