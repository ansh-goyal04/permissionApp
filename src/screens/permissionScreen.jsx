import React, {useState} from 'react';
import {
  Button,
  PermissionsAndroid,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Alert,
  Platform,
  Linking,
  SafeAreaView,
} from 'react-native';

const PermissionScreen = () => {
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



  // Helper function to check if permission is granted
  const isPermissionGranted = (status) => {
    return ['Granted', 'Configured', 'Not Required'].includes(status);
  };

  // Request Location Permission
  const requestLocationPermission = async () => {
    try {
      console.log('Requesting location permission...');
      
      // Check if platform is Android
      if (Platform.OS !== 'android') {
        Alert.alert('Platform Error', 'This permission system is designed for Android');
        return;
      }

      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission Required',
          message:
            'This app needs access to your location to provide location-based services.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      
      console.log('Location permission result:', granted);
      
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Location permission granted');
        setPermissionStatus(prev => ({...prev, location: 'Granted'}));
      } else {
        console.log('Location permission denied');
        setPermissionStatus(prev => ({...prev, location: 'Denied'}));
        setButtonStates(prev => ({...prev, location: { acceptDisabled: false, denyDisabled: true }}));
      }
    } catch (err) {
      console.warn('Location permission error:', err);
      setPermissionStatus(prev => ({...prev, location: 'Error'}));
    }
  };

  // Deny Location Permission
  const denyLocationPermission = () => {
    setPermissionStatus(prev => ({...prev, location: 'Denied'}));
    setButtonStates(prev => ({...prev, location: { acceptDisabled: false, denyDisabled: true }}));
  };

  // Request Physical Activity Permission (Android API 29+)
  const requestActivityPermission = async () => {
    try {
      console.log('Requesting activity permission...');
      
      if (Platform.OS !== 'android') {
        Alert.alert('Platform Error', 'This permission system is designed for Android');
        return;
      }

      if (Platform.Version >= 29) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION,
          {
            title: 'Physical Activity Permission Required',
            message:
              'This app needs access to your physical activity data to track if you are walking, driving or running',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        
        console.log('Activity permission result:', granted);
        
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Activity permission granted');
          setPermissionStatus(prev => ({...prev, activity: 'Granted'}));
        } else {
          console.log('Activity permission denied');
          setPermissionStatus(prev => ({...prev, activity: 'Denied'}));
          setButtonStates(prev => ({...prev, activity: { acceptDisabled: false, denyDisabled: true }}));
        }
      } else {
        console.log('Activity permission not required for Android version:', Platform.Version);
        setPermissionStatus(prev => ({...prev, activity: 'Not Required'}));
      }
    } catch (err) {
      console.warn('Activity permission error:', err);
      setPermissionStatus(prev => ({...prev, activity: 'Error'}));
    }
  };

  // Deny Activity Permission
  const denyActivityPermission = () => {
    setPermissionStatus(prev => ({...prev, activity: 'Denied'}));
    setButtonStates(prev => ({...prev, activity: { acceptDisabled: false, denyDisabled: true }}));
  };

  // Request Bluetooth Permission (Android 12+)
  const requestBluetoothPermission = async () => {
    try {
      console.log('Requesting bluetooth permission...');
      
      if (Platform.OS !== 'android') {
        Alert.alert('Platform Error', 'This permission system is designed for Android');
        return;
      }

      if (Platform.Version >= 31) {
        // For Android 12+ (API 31+)
        const permissions = [
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        ];
        
        const granted = await PermissionsAndroid.requestMultiple(permissions);
        
        console.log('Bluetooth permission result:', granted);
        
        if (
          granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] === PermissionsAndroid.RESULTS.GRANTED &&
          granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] === PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.log('Bluetooth permissions granted');
          setPermissionStatus(prev => ({...prev, bluetooth: 'Granted'}));
        } else {
          console.log('Bluetooth permissions denied');
          setPermissionStatus(prev => ({...prev, bluetooth: 'Denied'}));
          setButtonStates(prev => ({...prev, bluetooth: { acceptDisabled: false, denyDisabled: true }}));
        }
      } else {
        // For older Android versions, no runtime permission needed
        console.log('Bluetooth permission not required for Android version:', Platform.Version);
        setPermissionStatus(prev => ({...prev, bluetooth: 'Not Required'}));
      }
    } catch (err) {
      console.warn('Bluetooth permission error:', err);
      setPermissionStatus(prev => ({...prev, bluetooth: 'Error'}));
    }
  };

  // Deny Bluetooth Permission
  const denyBluetoothPermission = () => {
    setPermissionStatus(prev => ({...prev, bluetooth: 'Denied'}));
    setButtonStates(prev => ({...prev, bluetooth: { acceptDisabled: false, denyDisabled: true }}));
  };

  // Request Battery Optimization Permission
  const requestBatteryOptimizationPermission = async () => {
    try {
      // Battery optimization is handled differently - need to open settings
      Alert.alert(
        'Battery Optimization',
        'To ensure the app works properly in the background, please disable battery optimization for this app. You will be redirected to the settings.\n\nAfter making changes, return to the app and tap "Check Status" to update.',
        [
          {
            text: 'Cancel',
            onPress: () => setPermissionStatus(prev => ({...prev, battery: 'Cancelled'})),
            style: 'cancel',
          },
          {
            text: 'Open Settings',
            onPress: () => {
              // Open battery optimization settings
              Linking.openSettings();
              setPermissionStatus(prev => ({...prev, battery: 'Settings Opened - Please Return'}));
            },
          },
        ],
      );
    } catch (err) {
      console.warn(err);
      setPermissionStatus(prev => ({...prev, battery: 'Error'}));
    }
  };

  // Accept Battery Optimization Permission
  const acceptBatteryOptimizationPermission = () => {
    Alert.alert(
      'Battery Optimization',
      'To ensure the app works properly in the background, please disable battery optimization for this app. You will be redirected to the settings.\n\nAfter making changes, return to the app.',
      [
        {
          text: 'Cancel',
          onPress: () => setPermissionStatus(prev => ({...prev, battery: 'Cancelled'})),
          style: 'cancel',
        },
        {
          text: 'Open Settings',
          onPress: () => {
            // Open battery optimization settings
            Linking.openSettings();
            setPermissionStatus(prev => ({...prev, battery: 'Settings Opened - Please Return'}));
            
            // Show the confirmation popup when user returns to the app
            setTimeout(() => {
              checkBatteryOptimizationStatus();
            }, 1000); // Small delay to ensure settings opened
          },
        },
      ],
    );
  };

  // Deny Battery Optimization Permission
  const denyBatteryOptimizationPermission = () => {
    setPermissionStatus(prev => ({...prev, battery: 'Denied'}));
    setButtonStates(prev => ({...prev, battery: { acceptDisabled: false, denyDisabled: true }}));
  };

  // Check Battery Optimization Status (Manual confirmation)
  const checkBatteryOptimizationStatus = () => {
    Alert.alert(
      'Battery Optimization Status',
      'Did you disable battery optimization for this app in the settings?',
      [
        {
          text: 'No, Open Settings Again',
          onPress: () => {
            Linking.openSettings();
            setPermissionStatus(prev => ({...prev, battery: 'Settings Opened - Please Return'}));
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

  // Granted Indicator Component
  const GrantedIndicator = () => (
    <View style={styles.grantedIndicator}>
      <Text style={styles.grantedText}>✓ Granted</Text>
    </View>
  );



  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>App Permissions</Text>
      <Text style={styles.subtitle}>
        Please grant the following permissions for the best experience:
      </Text>

      <View style={styles.permissionContainer}>
        <View style={styles.permissionItem}>
          <Text style={styles.permissionText}>
            📍 Location: {permissionStatus.location}
          </Text>
          <Text style={styles.permissionDescription}>
            Required for location-based services
          </Text>
          {isPermissionGranted(permissionStatus.location) ? (
            <GrantedIndicator />
          ) : (
            <View style={styles.buttonRow}>
              <View style={styles.buttonHalf}>
                <Button
                  title="Deny"
                  onPress={denyLocationPermission}
                  color="#FF3B30"
                  disabled={buttonStates.location.denyDisabled}
                />
              </View>
              <View style={styles.buttonHalf}>
                <Button
                  title="Accept"
                  onPress={requestLocationPermission}
                  color="#34C759"
                  disabled={buttonStates.location.acceptDisabled}
                />
              </View>
              
            </View>
          )}
        </View>

        <View style={styles.permissionItem}>
          <Text style={styles.permissionText}>
            🏃‍♂️ Physical Activity: {permissionStatus.activity}
          </Text>
          <Text style={styles.permissionDescription}>
            Required for tracking physical activity
          </Text>
          {isPermissionGranted(permissionStatus.activity) ? (
            <GrantedIndicator />
          ) : (
            <View style={styles.buttonRow}>
               <View style={styles.buttonHalf}>
                <Button
                  title="Deny"
                  onPress={denyActivityPermission}
                  color="#FF3B30"
                  disabled={buttonStates.activity.denyDisabled}
                />
              </View>
              <View style={styles.buttonHalf}>
                <Button
                  title="Accept"
                  onPress={requestActivityPermission}
                  color="#34C759"
                  disabled={buttonStates.activity.acceptDisabled}
                />
              </View>
             
            </View>
          )}
        </View>

        <View style={styles.permissionItem}>
          <Text style={styles.permissionText}>
            📶 Bluetooth: {permissionStatus.bluetooth}
          </Text>
          <Text style={styles.permissionDescription}>
            Required for device connectivity
          </Text>
          {isPermissionGranted(permissionStatus.bluetooth) ? (
            <GrantedIndicator />
          ) : (
            <View style={styles.buttonRow}>
              <View style={styles.buttonHalf}>
                <Button
                  title="Deny"
                  onPress={denyBluetoothPermission}
                  color="#FF3B30"
                  disabled={buttonStates.bluetooth.denyDisabled}
                />
              </View>
              <View style={styles.buttonHalf}>
                <Button
                  title="Accept"
                  onPress={requestBluetoothPermission}
                  color="#34C759"
                  disabled={buttonStates.bluetooth.acceptDisabled}
                />
              </View>
              
            </View>
          )}
        </View>

        <View style={styles.permissionItem}>
          <Text style={styles.permissionText}>
            🔋 Battery Optimization: {permissionStatus.battery}
          </Text>
          <Text style={styles.permissionDescription}>
            Ensures app works in background
          </Text>
          {isPermissionGranted(permissionStatus.battery) ? (
            <GrantedIndicator />
          ) : (
            <View style={styles.buttonRow}>
              <View style={styles.buttonHalf}>
                <Button
                  title="Deny"
                  onPress={denyBatteryOptimizationPermission}
                  color="#FF3B30"
                  disabled={buttonStates.battery.denyDisabled}
                />
              </View>
              <View style={styles.buttonHalf}>
                <Button
                  title="Accept"
                  onPress={acceptBatteryOptimizationPermission}
                  color="#34C759"
                  disabled={buttonStates.battery.acceptDisabled}
                />
              </View>
              
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: StatusBar.currentHeight,
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
    lineHeight: 22,
  },
  permissionContainer: {
    marginBottom: 30,
  },
  permissionItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  permissionText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
    fontWeight: '500',
  },
  permissionDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  buttonHalf: {
    flex: 1,
  },
  grantedIndicator: {
    backgroundColor: '#34C759',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grantedText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statusButtonContainer: {
    marginTop: 10,
  },
});

export default PermissionScreen;