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

  // Request Location Permission
  const requestLocationPermission = async () => {
    try {
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
      
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Location permission granted');
        setPermissionStatus(prev => ({...prev, location: 'Granted'}));
      } else {
        console.log('Location permission denied');
        setPermissionStatus(prev => ({...prev, location: 'Denied'}));
      }
    } catch (err) {
      console.warn(err);
      setPermissionStatus(prev => ({...prev, location: 'Error'}));
    }
  };

  // Request Physical Activity Permission (Android API 29+)
  const requestActivityPermission = async () => {
    try {
      if (Platform.Version >= 29) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION,
          {
            title: 'Physical Activity Permission Required',
            message:
              'This app needs access to your physical activity data to track your fitness activities.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Activity permission granted');
          setPermissionStatus(prev => ({...prev, activity: 'Granted'}));
        } else {
          console.log('Activity permission denied');
          setPermissionStatus(prev => ({...prev, activity: 'Denied'}));
        }
      } else {
        console.log('Activity permission not required for this Android version');
        setPermissionStatus(prev => ({...prev, activity: 'Not Required'}));
      }
    } catch (err) {
      console.warn(err);
      setPermissionStatus(prev => ({...prev, activity: 'Error'}));
    }
  };

  // Request Bluetooth Permission (Android 12+)
  const requestBluetoothPermission = async () => {
    try {
      if (Platform.Version >= 31) {
        // For Android 12+ (API 31+)
        const permissions = [
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        ];
        
        const granted = await PermissionsAndroid.requestMultiple(permissions);
        
        if (
          granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] === PermissionsAndroid.RESULTS.GRANTED &&
          granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] === PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.log('Bluetooth permissions granted');
          setPermissionStatus(prev => ({...prev, bluetooth: 'Granted'}));
        } else {
          console.log('Bluetooth permissions denied');
          setPermissionStatus(prev => ({...prev, bluetooth: 'Denied'}));
        }
      } else {
        // For older Android versions, no runtime permission needed
        console.log('Bluetooth permission not required for this Android version');
        setPermissionStatus(prev => ({...prev, bluetooth: 'Not Required'}));
      }
    } catch (err) {
      console.warn(err);
      setPermissionStatus(prev => ({...prev, bluetooth: 'Error'}));
    }
  };

  // Request Battery Optimization Permission
  const requestBatteryOptimizationPermission = async () => {
    try {
      // Battery optimization is handled differently - need to open settings
      Alert.alert(
        'Battery Optimization',
        'To ensure the app works properly in the background, please disable battery optimization for this app. You will be redirected to the settings.',
        [
          {
            text: 'Cancel',
            onPress: () => setPermissionStatus(prev => ({...prev, battery: 'Denied'})),
            style: 'cancel',
          },
          {
            text: 'Open Settings',
            onPress: () => {
              // Open battery optimization settings
              Linking.openSettings();
              setPermissionStatus(prev => ({...prev, battery: 'Settings Opened'}));
            },
          },
        ],
      );
    } catch (err) {
      console.warn(err);
      setPermissionStatus(prev => ({...prev, battery: 'Error'}));
    }
  };

  // Request All Permissions
  const requestAllPermissions = async () => {
    await requestLocationPermission();
    await requestActivityPermission();
    await requestBluetoothPermission();
    await requestBatteryOptimizationPermission();
  };

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
          <Button
            title="Request Location"
            onPress={requestLocationPermission}
            color="#007AFF"
          />
        </View>

        <View style={styles.permissionItem}>
          <Text style={styles.permissionText}>
            🏃‍♂️ Physical Activity: {permissionStatus.activity}
          </Text>
          <Text style={styles.permissionDescription}>
            Required for fitness tracking
          </Text>
          <Button
            title="Request Activity"
            onPress={requestActivityPermission}
            color="#34C759"
          />
        </View>

        <View style={styles.permissionItem}>
          <Text style={styles.permissionText}>
            📶 Bluetooth: {permissionStatus.bluetooth}
          </Text>
          <Text style={styles.permissionDescription}>
            Required for device connectivity
          </Text>
          <Button
            title="Request Bluetooth"
            onPress={requestBluetoothPermission}
            color="#FF9500"
          />
        </View>

        <View style={styles.permissionItem}>
          <Text style={styles.permissionText}>
            🔋 Battery Optimization: {permissionStatus.battery}
          </Text>
          <Text style={styles.permissionDescription}>
            Ensures app works in background
          </Text>
          <Button
            title="Request Battery"
            onPress={requestBatteryOptimizationPermission}
            color="#FF3B30"
          />
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Request All Permissions"
          onPress={requestAllPermissions}
          color="#5856D6"
        />
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
  buttonContainer: {
    marginTop: 20,
  },
});

export default PermissionScreen;