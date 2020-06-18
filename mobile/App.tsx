import React from 'react';
import { StatusBar } from 'react-native';
import { AppLoading } from 'expo'
import { Roboto_400Regular, Roboto_500Medium } from '@expo-google-fonts/roboto';
import { Ubuntu_700Bold, useFonts } from '@expo-google-fonts/ubuntu';
import Routes from './src/routes'

export default function App() {
  // fontes baixadas do google atraves do expo
  const [fontsLoaded] = useFonts({
    Roboto_400Regular,
    Roboto_500Medium,
    Ubuntu_700Bold
  })

  // app loading é lib do expo para loading enquanto algo nao carrega
  if (!fontsLoaded) {
    return <AppLoading />
  }

  // status bar para estilizar a barra de cima onde fica a bateria, horas...
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <Routes />
    </>
  );
}