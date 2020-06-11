import React , { useState, ChangeEvent, useEffect }  from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import RNPickerSelect  from 'react-native-picker-select';
import api from '../services/api';
import MapView from 'react-native-maps';
import * as Location from 'expo-location';

interface Uf{
  id: number,
  sigla: string,
  nome:string
}

interface Cidade{
  id: number,
  nome:string
}

const Home = () =>{
    const navigation = useNavigation();
    const [selectedUf, setSelectedUF] = useState('0');
    const [selectedCidade, setSelectedCidade] = useState('0');
    const [ufs, setUfs] = useState<Uf[]>([]);
    const [cidades, setCidades] = useState<Cidade[]>([]);
    const [ initialPosition, setInitialPosition] = useState<[number,number]>([0,0]);

    useEffect(() =>{
      api.get('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome').then(response =>{
          setUfs(response.data);
          //console.log(ufs);
      })
    },[] );

    useEffect(() => {
        if(selectedUf==='0'){
            return;
        }
        api.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios?orderBy=nome`).then(response =>{
            setCidades(response.data);

        })
    },[selectedUf])

    useEffect(() => {
      async function loadPosition(){
          const { status } = await Location.requestPermissionsAsync();
          if(status !== 'granted'){
              Alert.alert('Oooops...','Precisamos de sua permissão para obter a localização.');
              return;
          }

          const location = await Location.getCurrentPositionAsync();
          const { latitude, longitude } = location.coords;
          setInitialPosition([latitude,longitude]);
          
          GeoCoding(latitude, longitude);
      }
      loadPosition();
  },[]);

  async function GeoCoding(latitude:any,longitude:any){
    
    const response = await api.get(`https://api.opencagedata.com/geocode/v1/geojson?q=${latitude}%2C%20${longitude}&key=ADD_YOUR_API_KEY&language=pt&pretty=1`);
        var resultado = response.data;
        const arq = resultado.features[0];
        const {city , state_code} = arq.properties.components;
        setSelectedCidade(city);
        setSelectedUF(state_code);
    }

    function handleSelectUF(event: any){
      const uf = event;
      setSelectedUF(uf);
    }
    
    function handleSelectCidade(event: any){
        const cidade = event;
        setSelectedCidade(cidade);
    }

    return (
        <KeyboardAvoidingView style={{ flex:1 }} behavior={Platform.OS === 'ios' ? 'padding': undefined}>
            <View style={styles.main}>
                <RNPickerSelect
                  style={{
                    ...pickerSelectStyles,
                    iconContainer: {
                      top: 20,
                      right: 10,
                    },
                    placeholder: {
                      color: '#6C6C80',
                      fontSize: 12,
                      fontWeight: 'bold',
                    },
                  }}
                  placeholder={{
                    label: 'Selecione a UF',
                    value: 0,
                    color: 'black',
                  }}
                  onValueChange={ (value) => handleSelectUF(value)}
                  value={selectedUf}
                    items={[...ufs.map(uf=>(
                      { label: uf.sigla, value: uf.sigla }
                    ))]}
                />
                <RNPickerSelect
                  style={{
                    ...pickerSelectStyles,
                    iconContainer: {
                      top: 20,
                      right: 10,
                    },
                    placeholder: {
                      color: '#6C6C80',
                      fontSize: 12,
                      fontWeight: 'bold',
                    },
                  }}
                  placeholder={{
                    label: 'Selecione a Cidade',
                    value: 0,
                    color: 'black',
                  }}
                  onValueChange={ (value) => handleSelectCidade(value)}
                  value={selectedCidade}
                    items={[...cidades.map(cidade=>(
                      { label: cidade.nome, value: cidade.nome }
                    ))]}
                />

                <View style={styles.mapContainer}>
                    { initialPosition[0] !== 0 && (
                        <MapView 
                            style={styles.map} 
                            initialRegion={{
                                latitude: initialPosition[0],
                                longitude: initialPosition[1],
                                latitudeDelta: 0.014,
                                longitudeDelta: 0.014
                            }}
                        >
                        </MapView>
                    ) }
                </View>
            </View>
        </KeyboardAvoidingView>
    )
};

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
  
    height: 60,
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 8,
    paddingHorizontal: 24,
    fontSize: 16,

  },
  inputAndroid: {
    height: 60,
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 8,
    paddingHorizontal: 24,
    fontSize: 16,
  },
});

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 32,
      backgroundColor: '#f0f0f5',
    },
  
    main: {
      flex: 1,
      
      marginTop:30,
    },
  
    title: {
      color: '#322153',
      fontSize: 32,
     
      maxWidth: 260,
      marginTop: 64,
    },
  
    description: {
      color: '#6C6C80',
      fontSize: 16,
      marginTop: 16,

      maxWidth: 260,
      lineHeight: 24,
    },
  
    footer: {},
  
    select: {},
  
    input: {
      height: 60,
      backgroundColor: '#FFF',
      borderRadius: 10,
      marginBottom: 8,
      paddingHorizontal: 24,
      fontSize: 16,
    },
  
    button: {
      backgroundColor: '#34CB79',
      height: 60,
      flexDirection: 'row',
      borderRadius: 10,
      overflow: 'hidden',
      alignItems: 'center',
      marginTop: 8,
    },
  
    buttonIcon: {
      height: 60,
      width: 60,
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      justifyContent: 'center',
      alignItems: 'center'
    },
  
    buttonText: {
      flex: 1,
      justifyContent: 'center',
      textAlign: 'center',
      color: '#FFF',

      fontSize: 16,
    },

    mapContainer: {
      flex: 1,
      width: '100%',
      borderRadius: 10,
      overflow: 'hidden',
      marginTop: 16,
    },
  
    map: {
      width: '100%',
      height: '100%',
    },
  
    mapMarker: {
      width: 90,
      height: 80, 
    },
  
    mapMarkerContainer: {
      width: 90,
      height: 70,
      backgroundColor: '#34CB79',
      flexDirection: 'column',
      borderRadius: 8,
      overflow: 'hidden',
      alignItems: 'center'
    },
  
    mapMarkerImage: {
      width: 90,
      height: 45,
      resizeMode: 'cover',
    },
  
    mapMarkerTitle: {
      flex: 1,
      fontFamily: 'Roboto_400Regular',
      color: '#FFF',
      fontSize: 13,
      lineHeight: 23,
    },

  });
  
export default Home;