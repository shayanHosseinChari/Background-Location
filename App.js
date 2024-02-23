import React from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';

const BACKGROUND_FETCH_TASK = 'background-fetch-with-location';

TaskManager.defineTask(BACKGROUND_FETCH_TASK, async ({ data, error }) => {
  const now = Date.now();
  console.log(`Got background fetch call at date: ${new Date(now).toISOString()}`);
  try {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permission to access location was denied');
      return; 
    }

    let location = await Location.getCurrentPositionAsync({});
   
    console.log('run in background');
    console.log(location)
    
  
} catch (error) {
    console.log(error);
}
  return BackgroundFetch.BackgroundFetchResult.NewData;
});

async function registerBackgroundFetchAsync() {
  return await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
    minimumInterval: 5, 
    stopOnTerminate: false, 
    startOnBoot: true, 
    
  });
}

async function unregisterBackgroundFetchAsync() {
  return await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
}

export default function App() {
  const [isRegistered, setIsRegistered] = React.useState(false);
  const [status, setStatus] = React.useState(null);



  const checkStatusAsync = async () => {
    const status = await BackgroundFetch.getStatusAsync();
    registerBackgroundFetchAsync()
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);
    setStatus(status);
    setIsRegistered(isRegistered);
  };

  const toggleFetchTask = async () => {
    if (isRegistered) {
      if (await Location.hasStartedLocationUpdatesAsync(BACKGROUND_FETCH_TASK)) {
        await Location.stopLocationUpdatesAsync(BACKGROUND_FETCH_TASK);
      }
      await unregisterBackgroundFetchAsync();
    } else {
      if (!(await Location.hasStartedLocationUpdatesAsync(BACKGROUND_FETCH_TASK))) {
        await Location.startLocationUpdatesAsync(BACKGROUND_FETCH_TASK, {
          accuracy: Location.Accuracy.BestForNavigation,
        });
      }
      await registerBackgroundFetchAsync();
    }

    checkStatusAsync();
  };
  React.useEffect(() => {
    checkStatusAsync();
  }, []);
  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text>
          Background fetch status:{' '}
          <Text style={styles.boldText}>
            {status && BackgroundFetch.BackgroundFetchStatus[status]}
          </Text>
        </Text>
        <Text>
          Background fetch task name:{' '}
          <Text style={styles.boldText}>
            {isRegistered ? BACKGROUND_FETCH_TASK : 'Not registered yet!'}
          </Text>
        </Text>
      </View>
      <View style={styles.textContainer}></View>
      <Button
        title={isRegistered ? 'Unregister BackgroundFetch task' : 'Register BackgroundFetch task'}
        onPress={toggleFetchTask}
      />
    </View>
  );
}


const styles = StyleSheet.create({ 
  container:{
      flex:1,
      justifyContent:"center",
      alignItems:'center'
  }
}); 
