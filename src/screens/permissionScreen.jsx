import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  PermissionsAndroid,
  Alert,
  Platform,
  Linking,
  StatusBar,
  AppState
} from 'react-native';

const PermissionScreen = () => {
  // Original state management
  const [permissionStatus, setPermissionStatus] = useState({
    location: 'Not Requested',
    activity: 'Not Requested',
    bluetooth: 'Not Requested',
    battery: 'Not Requested',
  });

  const [buttonStates, setButtonStates] = useState({
    location: { acceptDisabled: false, denyDisabled: false },
    activity: { acceptDisabled: false, denyDisabled: false },
    bluetooth: { acceptDisabled: false, denyDisabled: false },
    battery: { acceptDisabled: false, denyDisabled: false },
  });

  // New state to track if user went to settings for battery optimization
  const [batterySettingsOpened, setBatterySettingsOpened] = useState(false);

  // Listen for app state changes to detect when user returns from settings
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'active' && batterySettingsOpened) {
        // User returned from settings, show the status check popup
        setBatterySettingsOpened(false);
        checkBatteryOptimizationStatus();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [batterySettingsOpened]);

  // Original helper function
  const isPermissionGranted = (status) => {
    return ['Granted', 'Configured', 'Not Required'].includes(status);
  };

  // Original permission request functions
  const requestLocationPermission = async () => {
    try {
      if (Platform.OS !== 'android') {
        Alert.alert('Platform Error', 'This permission system is designed for Android');
        return;
      }

      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission Required',
          message: 'This app needs access to your location to provide location-based services.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        setPermissionStatus(prev => ({...prev, location: 'Granted'}));
      } else {
        setPermissionStatus(prev => ({...prev, location: 'Denied'}));
        setButtonStates(prev => ({...prev, location: { acceptDisabled: false, denyDisabled: true }}));
      }
    } catch (err) {
      setPermissionStatus(prev => ({...prev, location: 'Error'}));
    }
  };

  const denyLocationPermission = () => {
    setPermissionStatus(prev => ({...prev, location: 'Denied'}));
    setButtonStates(prev => ({...prev, location: { acceptDisabled: false, denyDisabled: true }}));
  };

  const requestActivityPermission = async () => {
    try {
      if (Platform.OS !== 'android') {
        Alert.alert('Platform Error', 'This permission system is designed for Android');
        return;
      }

      if (Platform.Version >= 29) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION,
          {
            title: 'Physical Activity Permission Required',
            message: 'This app needs access to your physical activity data to track if you are walking, driving or running',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setPermissionStatus(prev => ({...prev, activity: 'Granted'}));
        } else {
          setPermissionStatus(prev => ({...prev, activity: 'Denied'}));
          setButtonStates(prev => ({...prev, activity: { acceptDisabled: false, denyDisabled: true }}));
        }
      } else {
        setPermissionStatus(prev => ({...prev, activity: 'Not Required'}));
      }
    } catch (err) {
      setPermissionStatus(prev => ({...prev, activity: 'Error'}));
    }
  };

  const denyActivityPermission = () => {
    setPermissionStatus(prev => ({...prev, activity: 'Denied'}));
    setButtonStates(prev => ({...prev, activity: { acceptDisabled: false, denyDisabled: true }}));
  };

  const requestBluetoothPermission = async () => {
    try {
      if (Platform.OS !== 'android') {
        Alert.alert('Platform Error', 'This permission system is designed for Android');
        return;
      }

      if (Platform.Version >= 31) {
        const permissions = [
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        ];
        
        const granted = await PermissionsAndroid.requestMultiple(permissions);
        
        if (
          granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] === PermissionsAndroid.RESULTS.GRANTED &&
          granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] === PermissionsAndroid.RESULTS.GRANTED
        ) {
          setPermissionStatus(prev => ({...prev, bluetooth: 'Granted'}));
        } else {
          setPermissionStatus(prev => ({...prev, bluetooth: 'Denied'}));
          setButtonStates(prev => ({...prev, bluetooth: { acceptDisabled: false, denyDisabled: true }}));
        }
      } else {
        setPermissionStatus(prev => ({...prev, bluetooth: 'Not Required'}));
      }
    } catch (err) {
      setPermissionStatus(prev => ({...prev, bluetooth: 'Error'}));
    }
  };

  const denyBluetoothPermission = () => {
    setPermissionStatus(prev => ({...prev, bluetooth: 'Denied'}));
    setButtonStates(prev => ({...prev, bluetooth: { acceptDisabled: false, denyDisabled: true }}));
  };

  // Updated battery optimization functions
  const requestBatteryOptimizationPermission = async () => {
    try {
      Alert.alert(
        'Battery Optimization',
        'To ensure the app works properly in the background, please disable battery optimization for this app. You will be redirected to the settings.',
        [
          {
            text: 'Cancel',
            onPress: () => setPermissionStatus(prev => ({...prev, battery: 'Cancelled'})),
            style: 'cancel',
          },
          {
            text: 'Open Settings',
            onPress: () => {
              setBatterySettingsOpened(true);
              setPermissionStatus(prev => ({...prev, battery: 'Settings Opened - Please Return'}));
              Linking.openSettings();
            },
          },
        ],
      );
    } catch (err) {
      setPermissionStatus(prev => ({...prev, battery: 'Error'}));
    }
  };

  const acceptBatteryOptimizationPermission = () => {
    requestBatteryOptimizationPermission();
  };

  const denyBatteryOptimizationPermission = () => {
    setPermissionStatus(prev => ({...prev, battery: 'Denied'}));
    setButtonStates(prev => ({...prev, battery: { acceptDisabled: false, denyDisabled: true }}));
  };

  const checkBatteryOptimizationStatus = () => {
    Alert.alert(
      'Battery Optimization Status',
      'Did you disable battery optimization for this app in the settings?',
      [
        {
          text: 'No, Open Settings Again',
          onPress: () => {
            setBatterySettingsOpened(true);
            setPermissionStatus(prev => ({...prev, battery: 'Settings Opened - Please Return'}));
            Linking.openSettings();
          },
        },
        {
          text: 'Yes, I Disabled It',
          onPress: () => {
            setPermissionStatus(prev => ({...prev, battery: 'Configured'}));
          },
        },
      ],
    );
  };

  // UI Rendering with enhanced visuals
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>App Permissions</Text>
          <Text style={styles.subtitle}>
            Please grant the following permissions for the best experience
          </Text>
        </View>

        {/* Location Permission Card */}
        <View style={styles.permissionCard}>
          <Text style={styles.permissionTitle}>📍 Location Access</Text>
          <Text style={styles.permissionStatus}>
            Status: <Text style={permissionStatus.location === 'Granted' ? styles.statusGranted : styles.statusDefault}>
              {permissionStatus.location}
            </Text>
          </Text>
          <Text style={styles.permissionDescription}>
            Required for location-based services
          </Text>
          
          {isPermissionGranted(permissionStatus.location) ? (
            <View style={styles.grantedBadge}>
              <Text style={styles.grantedText}>Permission Granted</Text>
            </View>
          ) : (
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.button, styles.denyButton]}
                onPress={denyLocationPermission}
                disabled={buttonStates.location.denyDisabled}
              >
                <Text style={styles.buttonText}>Deny</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, styles.acceptButton]}
                onPress={requestLocationPermission}
                disabled={buttonStates.location.acceptDisabled}
              >
                <Text style={styles.buttonText}>Accept</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Activity Recognition Card */}
        <View style={styles.permissionCard}>
          <Text style={styles.permissionTitle}>🏃‍♂️ Physical Activity</Text>
          <Text style={styles.permissionStatus}>
            Status: <Text style={permissionStatus.activity === 'Granted' ? styles.statusGranted : styles.statusDefault}>
              {permissionStatus.activity}
            </Text>
          </Text>
          <Text style={styles.permissionDescription}>
            Required for tracking physical activity
          </Text>
          
          {isPermissionGranted(permissionStatus.activity) ? (
            <View style={styles.grantedBadge}>
              <Text style={styles.grantedText}>Permission Granted</Text>
            </View>
          ) : (
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.button, styles.denyButton]}
                onPress={denyActivityPermission}
                disabled={buttonStates.activity.denyDisabled}
              >
                <Text style={styles.buttonText}>Deny</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, styles.acceptButton]}
                onPress={requestActivityPermission}
                disabled={buttonStates.activity.acceptDisabled}
              >
                <Text style={styles.buttonText}>Accept</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Bluetooth Card */}
        <View style={styles.permissionCard}>
          <Text style={styles.permissionTitle}>📶 Bluetooth</Text>
          <Text style={styles.permissionStatus}>
            Status: <Text style={permissionStatus.bluetooth === 'Granted' ? styles.statusGranted : styles.statusDefault}>
              {permissionStatus.bluetooth}
            </Text>
          </Text>
          <Text style={styles.permissionDescription}>
            Required for device connectivity
          </Text>
          
          {isPermissionGranted(permissionStatus.bluetooth) ? (
            <View style={styles.grantedBadge}>
              <Text style={styles.grantedText}>Permission Granted</Text>
            </View>
          ) : (
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.button, styles.denyButton]}
                onPress={denyBluetoothPermission}
                disabled={buttonStates.bluetooth.denyDisabled}
              >
                <Text style={styles.buttonText}>Deny</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, styles.acceptButton]}
                onPress={requestBluetoothPermission}
                disabled={buttonStates.bluetooth.acceptDisabled}
              >
                <Text style={styles.buttonText}>Accept</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Battery Optimization Card */}
        <View style={styles.permissionCard}>
          <Text style={styles.permissionTitle}>🔋 Battery Optimization</Text>
          <Text style={styles.permissionStatus}>
            Status: <Text style={permissionStatus.battery === 'Configured' ? styles.statusGranted : styles.statusDefault}>
              {permissionStatus.battery}
            </Text>
          </Text>
          <Text style={styles.permissionDescription}>
            Ensures app works in background
          </Text>
          
          {isPermissionGranted(permissionStatus.battery) ? (
            <View style={styles.grantedBadge}>
              <Text style={styles.grantedText}>Configured</Text>
            </View>
          ) : (
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.button, styles.denyButton]}
                onPress={denyBatteryOptimizationPermission}
                disabled={buttonStates.battery.denyDisabled}
              >
                <Text style={styles.buttonText}>Deny</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, styles.acceptButton]}
                onPress={acceptBatteryOptimizationPermission}
                disabled={buttonStates.battery.acceptDisabled}
              >
                <Text style={styles.buttonText}>Configure</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Enhanced Styles Only
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#636e72',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  permissionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3436',
    marginBottom: 4,
  },
  permissionStatus: {
    fontSize: 14,
    color: '#636e72',
    marginBottom: 8,
  },
  statusGranted: {
    color: '#00b894',
    fontWeight: '500',
  },
  statusDefault: {
    color: '#636e72',
  },
  permissionDescription: {
    fontSize: 14,
    color: '#636e72',
    marginBottom: 16,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  denyButton: {
    backgroundColor: '#ffebee',
    borderWidth: 1,
    borderColor: '#ef9a9a',
  },
  acceptButton: {
    backgroundColor: '#e8f5e9',
    borderWidth: 1,
    borderColor: '#a5d6a7',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2d3436',
  },
  grantedBadge: {
    backgroundColor: '#e8f5e9',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#a5d6a7',
  },
  grantedText: {
    color: '#00b894',
    fontWeight: '500',
    fontSize: 14,
  },
});

export default PermissionScreen;