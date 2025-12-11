import { ScrollView, View, Text, Switch, TouchableOpacity } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useState, useEffect, useCallback } from 'react';

// --- Placeholder Data & Functions (For demonstration only) ---
const mockIoTData = {
  temperature: 41.5, // °C
  humidity: 16.0,  // % (Current Estimated Moisture Content)
  targetMC: 14.0,  // % (Target Moisture Content for Storage)
  
  isRainDetected: false, 
  isShakerOn: true,
  isPouring: false,
};

// Function to check if the rice is ready for storage (MC <= Target MC)
const isRiceReady = (currentHumidity, targetMC) => {
    // Rice is ready if current moisture is at or below the target
    return currentHumidity <= targetMC;
};

const getTempStatus = (temp) => {
  if (temp > 45) return { status: 'Overheating!', color: 'border-red-500 bg-red-500/10 text-red-700' };
  if (temp > 40) return { status: 'High Heat', color: 'border-yellow-500 bg-yellow-500/10 text-yellow-700' };
  return { status: 'Optimal', color: 'border-green-500 bg-green-500/10 text-green-700' };
};

// --- 💻 Components ---

/** Header Component **/
const Header = () => (
  <View className="p-4 pt-10 bg-white shadow-lg border-b border-gray-200">
    <Text className="text-2xl font-extrabold text-green-700">HarvestGuard</Text>
    <Text className="text-sm text-gray-500">Smart Rice Drying Dashboard</Text>
  </View>
);

/** 🌾 1. Environmental Monitoring Card **/
const SensorCard = ({ data }) => {
  const { temperature, humidity, targetMC } = data;
  const tempStyle = getTempStatus(temperature);

  return (
    <View className={`p-5 mb-4 rounded-xl border-l-4 ${tempStyle.color}`}>
      <Text className="text-xl font-bold mb-3 flex-row items-center">
        <Feather name="bar-chart-2" size={24} color={tempStyle.color.split(' ')[4]} />{' '}
        Drying Metrics
      </Text>
      
      <View className="flex-row justify-between py-2 border-b border-gray-200">
        <Text className="text-lg font-medium">Temperature</Text>
        <Text className={`text-3xl font-extrabold ${tempStyle.color.split(' ')[2]}`}>
          {temperature.toFixed(1)}°C
        </Text>
      </View>
      
      <View className="flex-row justify-between py-2 border-b border-gray-200">
        <Text className="text-lg font-medium">Current Moisture (MC% est.)</Text>
        <Text className={`text-3xl font-extrabold ${humidity <= targetMC ? 'text-green-600' : 'text-blue-800'}`}>
          {humidity.toFixed(1)}%
        </Text>
      </View>
      
      <View className="flex-row justify-between pt-2">
        <Text className="text-lg font-medium">Target Storage MC</Text>
        <Text className="text-2xl font-bold text-gray-600">
          {targetMC.toFixed(1)}%
        </Text>
      </View>
    </View>
  );
};

/** 🌧️ 2. Smart Rain Protection & Smart Shaker Control Card (FINAL LOGIC) **/
const RoofControlCard = ({ data, onToggleShaker }) => {
  const { isRainDetected, isShakerOn, isPouring, humidity, targetMC } = data; 
  const ready = isRiceReady(humidity, targetMC);

  // --- Logic for Weather/Roof Status (Fully Automated) ---
  let roofStatusText;
  let roofStatusColor;
  let weatherStatusText;
  let weatherStatusColor;
  
  if (isRainDetected) {
    weatherStatusText = 'RAIN DETECTED';
    weatherStatusColor = 'text-red-600';
    roofStatusText = 'CLOSED (Protecting)';
    roofStatusColor = 'text-red-600';
  } else {
    weatherStatusText = 'SUNNY'; 
    weatherStatusColor = 'text-green-600';
    roofStatusText = 'OPEN (Drying)';
    roofStatusColor = 'text-green-600';
  }
  
  // --- Logic for Shaker/Servo Status (DUAL ACTION) ---
  let shakerStatus;
  let shakerColor = 'text-gray-600';

  if (isPouring) {
    // Action 2: Storage Pour Mode (Transferring)
    shakerStatus = 'DUAL-ACTION: STORAGE TRANSFER'; 
    shakerColor = 'text-indigo-600';
  } else if (ready) {
    // Action 2 PENDING: Ready, but servo is idle (Waiting for auto-trigger/system confirmation)
     shakerStatus = 'DUAL-ACTION: TARGET MET - Shaking OFF';
     shakerColor = 'text-green-600';
  } else if (isShakerOn) {
    // Action 1: Shaker/Drying Mode (Continuous Movement)
    shakerStatus = 'DUAL-ACTION: RICE BALANCING (Continuous Movement)'; 
    shakerColor = 'text-blue-600';
  } else {
    // Servo is idle
    shakerStatus = 'DUAL-ACTION: INACTIVE (Shaking OFF)';
  }
  
  return (
    <View className="p-5 mb-4 rounded-xl border-l-4 border-slate-500 bg-white shadow-md">
      <Text className="text-xl font-bold mb-3 text-slate-700">
        <Feather name="tool" size={24} color="rgb(71 85 105)" /> Device Control
      </Text>

      {/* Weather and Roof Status */}
      <View className="flex-row justify-between items-center py-2 border-b border-gray-200">
        <Text className="text-lg font-medium">Weather Condition</Text>
        <Text className={`text-xl font-bold ${weatherStatusColor}`}>
          {weatherStatusText}
        </Text>
      </View>

      <View className="flex-row justify-between items-center py-2 border-b border-gray-200">
        <Text className="text-lg font-medium">Roof Action Status</Text>
        <Text className={`text-xl font-bold ${roofStatusText}`}>
          {roofStatusText}
        </Text>
      </View>

      {/* Rice Shaker/Pour Status */}
      <View className="flex-col justify-between items-start py-2 pt-4">
        <Text className="text-lg font-medium flex-row items-center mb-1">
          <MaterialCommunityIcons name="rotate-3d-variant" size={20} color="rgb(71 85 105)" /> Micro Servo Status
        </Text>
        <Text className={`text-xl font-bold ${shakerColor}`}>
           {shakerStatus}
        </Text>
        
        {/* Shaker Manual Toggle (Disabled when ready/pouring) */}
         <View className="flex-row justify-between items-center w-full mt-3 border-t border-gray-100 pt-2">
            <Text className="text-base text-gray-500">Enable Shaking (During Drying)</Text>
            <Switch
                value={isShakerOn}
                onValueChange={onToggleShaker}
                disabled={ready || isPouring} // Cannot toggle shaker if rice is ready or pouring
                trackColor={{ false: '#767577', true: '#4ade80' }}
                thumbColor={isShakerOn ? '#10b981' : '#f4f3f4'}
            />
        </View>
      </View>
    </View>
  );
};

/** 📦 3. Storage Management Card (Automatic Pouring Status) **/
const StorageCard = ({ data, onStopPouring }) => {
  const { isPouring, humidity, targetMC } = data;
  const isReady = isRiceReady(humidity, targetMC);

  let statusText = 'In Progress';
  let buttonText = 'AWAITING READY STATUS...';
  let buttonColor = 'bg-gray-400';
  let actionHandler = null;
  let disabled = true;

  if (isPouring) {
      statusText = 'Transferring to Storage (Auto Pour)'; // Indicates action is 'in progress'
      buttonText = 'STOP POURING/TRANSFER';
      buttonColor = 'bg-red-600 shadow-md';
      actionHandler = onStopPouring;
      disabled = false;
  } else if (isReady) {
      statusText = 'Ready! Automatic Pour Starting...';
      buttonText = 'POUR STARTED AUTOMATICALLY';
      buttonColor = 'bg-green-700 shadow-md';
      disabled = true; 
  }
  
  const statusColor = isReady ? 'border-green-600 bg-green-500/10 text-green-700' : 'border-blue-600 bg-blue-500/10 text-blue-700';

  return (
    <View className={`p-5 mb-4 rounded-xl border-l-4 ${statusColor}`}>
      <Text className="text-xl font-bold mb-3 flex-row items-center">
        <Feather name="archive" size={24} color={isReady ? 'rgb(5 150 105)' : 'rgb(37 99 235)'} />{' '}
        Storage & Notifications
      </Text>

      {/* Drying Status */}
      <View className="flex-row justify-between items-center py-2 border-b border-gray-200">
        <Text className="text-lg font-medium">Current Status</Text>
        <Text className={`text-2xl font-extrabold ${statusColor.split(' ')[2]}`}>
          {statusText}
        </Text>
      </View>

      {/* Move to Store Button (Used for emergency STOP when pouring) */}
      <TouchableOpacity
        onPress={actionHandler}
        disabled={disabled}
        className={`mt-4 py-3 rounded-lg ${buttonColor}`}
      >
        <Text className="text-lg font-bold text-center text-white">
          {buttonText}
        </Text>
      </TouchableOpacity>
      
      <Text className="mt-2 text-xs text-center text-gray-500">
        The micro servo automatically initiates transfer into the storage area when drying is complete.
      </Text>
    </View>
  );
};

// --- 🌐 Main Dashboard Component ---
const HarvestGuardDashboard = () => {
  const [data, setData] = useState(mockIoTData);
  const isReady = isRiceReady(data.humidity, data.targetMC);

  // Function to initiate the pour (automatically called by useEffect)
  const handleInitiatePour = useCallback(() => {
    if (isReady && !data.isPouring) {
        console.log('[IoT Command] AUTOMATIC: Initiating storage transfer.');
        // When pouring starts: shaking MUST stop, isPouring starts
        setData(prev => ({ ...prev, isShakerOn: false, isPouring: true }));
    }
  }, [isReady, data.isPouring]);

  // AUTOMATION EFFECT: Triggers the pour when the rice is ready (the core automation loop)
  useEffect(() => {
      if (isReady && !data.isPouring) {
          handleInitiatePour();
      }
  }, [isReady, data.isPouring, handleInitiatePour]);


  const handleToggleShaker = (value) => {
    if (!isReady && !data.isPouring) {
        console.log(`[IoT Command] Sending shaker command: ${value ? 'ON' : 'OFF'}`);
        setData(prev => ({ ...prev, isShakerOn: value }));
    }
  };

  const handleStopPouring = () => {
      // Emergency stop for the pour
      console.log('[IoT Command] STOP: Pouring manually interrupted.');
      setData(prev => ({ ...prev, isPouring: false }));
  };
  
  return (
    <View className="flex-1 bg-gray-100">
      <Header />
      <ScrollView className="flex-1 p-4">
        
        {/* 1. Metrics Card */}
        <SensorCard data={data} />
        
        {/* 2. Control Card */}
        <RoofControlCard 
          data={data}
          onToggleShaker={handleToggleShaker}
        />
        
        {/* 3. Storage Card */}
        <StorageCard
          data={data}
          onStopPouring={handleStopPouring}
        />
        
        {/* Simple mock button to test the READY state (for development) */}
        <TouchableOpacity
            onPress={() => setData(prev => ({ 
                ...prev, 
                // Toggle between NOT READY (20.0%) and READY (13.9%)
                humidity: prev.humidity > prev.targetMC ? prev.targetMC - 0.1 : 20.0, 
                isPouring: false 
            }))}
            className="mt-4 py-2 rounded-lg bg-indigo-500"
        >
            <Text className="text-sm font-bold text-center text-white">
                TEST: Toggle Moisture State ({data.humidity <= data.targetMC ? 'READY' : 'NOT READY'})
            </Text>
        </TouchableOpacity>

        <View className="h-10" />
      </ScrollView>
    </View>
  );
};

export default HarvestGuardDashboard;