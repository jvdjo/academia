import React, { useEffect, useState, useMemo } from 'react';
import { SafeAreaView, View, Text, TextInput, Pressable, FlatList, Modal, ScrollView, StyleSheet, useColorScheme, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';

const daysOfWeek = [
  { key: 'monday', name: 'Segunda' },
  { key: 'tuesday', name: 'Terça' },
  { key: 'wednesday', name: 'Quarta' },
  { key: 'thursday', name: 'Quinta' },
  { key: 'friday', name: 'Sexta' },
  { key: 'saturday', name: 'Sábado' },
  { key: 'sunday', name: 'Domingo' },
];

const lightTheme = {
  bg: '#f8fafc', text:'#111827', muted:'#6b7280', card:'#fff', border:'#e5e7eb', primary:'#2563eb', btnText:'#fff', secondaryBg:'#e5e7eb', secondaryText:'#111827', dotOn:'#22c55e', dotOff:'#6b7280'
}
const darkTheme = {
  bg: '#0f172a', text:'#e5e7eb', muted:'#9ca3af', card:'#111827', border:'#374151', primary:'#3b82f6', btnText:'#fff', secondaryBg:'#374151', secondaryText:'#e5e7eb', dotOn:'#22c55e', dotOff:'#6b7280'
}

function createStyles(t){
  return StyleSheet.create({
    container: { flex:1, backgroundColor:t.bg },
    containerCenter: { flex:1, alignItems:'center', justifyContent:'center', padding:16, backgroundColor:t.bg },
    header: { padding:16, borderBottomWidth:1, borderBottomColor:t.border, backgroundColor:t.card, flexDirection:'row', alignItems:'center', justifyContent:'space-between' },
    card: { backgroundColor:t.card, borderWidth:1, borderColor:t.border, borderRadius:12, padding:12 },
    h1: { fontSize:24, fontWeight:'700', color:t.text },
    h2: { fontSize:20, fontWeight:'700', color:t.text },
    dayCard: { flex: 1, margin: 6 },
    dayHeader: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:6 },
    dayTitle: { fontSize:16, fontWeight:'600', color:t.text },
    dayExercises: { marginTop:6 },
    statusDot: { width:10, height:10, borderRadius:10 },
    input: { borderWidth:1, borderColor:t.border, borderRadius:8, paddingHorizontal:10, paddingVertical:10, backgroundColor:t.card, color:t.text, marginTop:4 },
    label: { fontSize:12, color:t.muted, marginTop:8 },
    btn: { backgroundColor:t.primary, paddingVertical:10, paddingHorizontal:14, borderRadius:8, alignItems:'center', justifyContent:'center' },
    btnText: { color:t.btnText, fontWeight:'600' },
    btnSecondary: { backgroundColor:t.secondaryBg },
    btnSecondaryText: { color:t.secondaryText },
    small: { fontSize:12, color:t.text },
    smallLink: { fontSize:12, color:'#3b82f6', marginTop:8 },
    muted: { color:t.muted },
    row: { flexDirection:'row', gap: 8, marginTop: 12 },
    exItem: { borderWidth:1, borderColor:t.border, borderRadius:8, padding:10, marginBottom:10, backgroundColor:t.card },
    bold: { fontWeight:'600', color:t.text },
    setBox: { borderWidth:1, borderColor:t.border, borderRadius:8, padding:10, marginTop:8, backgroundColor:t.card },
    themeBtn: { marginLeft: 8 }
  });
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const systemScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState('light'); // 'light' | 'dark'
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;
  const styles = useMemo(()=>createStyles(theme), [theme]);

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem('academia_pro_user');
      if (raw) setUser(JSON.parse(raw));
      const t = await AsyncStorage.getItem('academia_theme');
      if (t === 'light' || t === 'dark') setThemeMode(t);
    })();
  }, []);

  const toggleTheme = async () => {
    const next = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(next);
    await AsyncStorage.setItem('academia_theme', next);
  }

  if (!user) return <LoginScreen onAuthenticated={setUser} loading={loading} setLoading={setLoading} styles={styles} theme={theme} onToggleTheme={toggleTheme} themeMode={themeMode} />;
  return <PlannerScreen user={user} onLogout={() => { AsyncStorage.multiRemove(['academia_pro_token','academia_pro_user']); setUser(null); }} styles={styles} theme={theme} onToggleTheme={toggleTheme} themeMode={themeMode} />
}

function LoginScreen({ onAuthenticated, loading, setLoading, styles, onToggleTheme, themeMode }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const submit = async () => {
    setLoading(true);
    try {
      const fn = isLogin ? api.auth.login : api.auth.register;
      const res = await fn(email, password);
      if (!res?.success) throw new Error(res?.error || 'Falha');
      const { token, user } = res.data;
      await AsyncStorage.setItem('academia_pro_token', token);
      await AsyncStorage.setItem('academia_pro_user', JSON.stringify(user));
      onAuthenticated(user);
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <SafeAreaView style={styles.containerCenter}>
      <View style={styles.card}>
        <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
          <Text style={styles.h1}>Academia Pro</Text>
          <Pressable onPress={onToggleTheme} style={[styles.btn, styles.btnSecondary, styles.themeBtn]}><Text style={[styles.btnText, styles.btnSecondaryText]}>{themeMode==='light'?'Escuro':'Claro'}</Text></Pressable>
        </View>
        <Text style={styles.muted}>Entre ou cadastre-se</Text>
        <View style={{ height: 12 }} />
        <Text style={styles.label}>Email</Text>
        <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" style={styles.input} />
        <Text style={styles.label}>Senha</Text>
        <TextInput value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
        <Pressable onPress={submit} style={[styles.btn, loading && { opacity: .7 }]} disabled={loading}>
          <Text style={styles.btnText}>{isLogin ? 'Entrar' : 'Cadastrar'}</Text>
        </Pressable>
        <Pressable onPress={() => setIsLogin(v=>!v)}>
          <Text style={[styles.smallLink]}>{isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entrar'}</Text>
        </Pressable>
      </View>
      <StatusBar style={themeMode==='dark' ? 'light' : 'dark'} />
    </SafeAreaView>
  );
}

function PlannerScreen({ user, onLogout, styles, onToggleTheme, themeMode }) {
  const [plan, setPlan] = useState({});
  const [openDay, setOpenDay] = useState(null);
  const [exerciseList, setExerciseList] = useState([]);
  const [allExercises, setAllExercises] = useState([]);
  const [query, setQuery] = useState('');
  const { width } = useWindowDimensions();
  const columns = width >= 900 ? 3 : width >= 600 ? 2 : 1;
  const [savedMap, setSavedMap] = useState({});
  const [toast, setToast] = useState(null);

  useEffect(() => {
    api.workouts.get().then(res => setPlan(res?.data || {})).catch(e=>alert(e.message));
    api.exercises.all().then(setAllExercises).catch(()=>{});
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allExercises.slice(0, 30);
    return allExercises.filter(n => n.toLowerCase().includes(q)).slice(0, 30);
  }, [allExercises, query]);

  const saveDay = async () => {
    if (!openDay) return;
    const muscles = []; // optional for now
    const res = await api.workouts.saveDay(openDay, { muscles, exercises: exerciseList });
    if (res?.success) {
      setPlan(p => ({ ...p, [openDay]: { muscles, exercises: exerciseList } }));
      setOpenDay(null);
      setExerciseList([]);
      setQuery('');
    }
  };

  const deleteDay = async (dayKey) => {
    const res = await api.workouts.deleteDay(dayKey);
    if (res?.success) setPlan(({ [dayKey]: _omit, ...rest }) => rest);
  };

  const notify = (msg) => { setToast(msg); setTimeout(()=> setToast(null), 1500); };

  const persistCurrentDay = async () => {
    if (!openDay) return;
    const muscles = (plan[openDay]?.muscles) || [];
    const res = await api.workouts.saveDay(openDay, { muscles, exercises: exerciseList });
    if (res?.success) {
      setPlan(p => ({ ...p, [openDay]: { muscles, exercises: exerciseList } }));
      return true;
    }
    return false;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.h2}>Academia Pro</Text>
        <View style={{ flexDirection:'row', alignItems:'center', gap: 8 }}>
          <Pressable onPress={onToggleTheme} style={[styles.btn, styles.btnSecondary]}><Text style={[styles.btnText, styles.btnSecondaryText]}>{themeMode==='light'?'Escuro':'Claro'}</Text></Pressable>
          <Text style={styles.muted}>{user?.email}</Text>
          <Pressable onPress={onLogout} style={[styles.btn, styles.btnSecondary]}><Text style={[styles.btnText, styles.btnSecondaryText]}>Sair</Text></Pressable>
        </View>
      </View>

      <FlatList
        contentContainerStyle={{ padding: 16, gap: 12 }}
        data={daysOfWeek}
        keyExtractor={i=>i.key}
        numColumns={columns}
        columnWrapperStyle={columns>1 ? { gap: 12 } : undefined}
        renderItem={({ item }) => {
          const dayPlan = plan[item.key] || { muscles: [], exercises: [] };
          const hasWorkout = (dayPlan.exercises || []).length > 0;
          return (
            <View style={[styles.card, styles.dayCard]}>
              <View style={styles.dayHeader}>
                <Text style={styles.dayTitle}>{item.name}</Text>
                <View style={[styles.statusDot, { backgroundColor: hasWorkout ? '#22c55e' : '#6b7280' }]} />
              </View>
              <Text style={styles.muted}>{dayPlan.muscles?.length ? dayPlan.muscles.join(', ') : 'Descanso'}</Text>
              <View style={styles.dayExercises}>
                {(dayPlan.exercises || []).map((ex, i) => {
                  const name = typeof ex === 'string' ? ex : ex.name;
                  const sets = typeof ex === 'string' ? [] : (ex.sets || []);
                  return (
                    <Pressable key={i} onPress={() => {
                      setOpenDay(item.key);
                      const normalized = (dayPlan.exercises || []).map(e => typeof e === 'string' ? ({ name: e, sets: [] }) : e);
                      setExerciseList(normalized);
                    }}>
                      <Text style={styles.small}>• {name}{sets.length>0 ? ` (${sets.map((s,si)=>`${si+1}ª: ${s.reps}x${s.weight}kg`).join(', ')})` : ''}</Text>
                    </Pressable>
                  );
                })}
              </View>
              <View style={styles.row}>
                <Pressable style={[styles.btn, { flex: 1 }]} onPress={() => { setOpenDay(item.key); setExerciseList((dayPlan.exercises||[]).map(e=> typeof e === 'string' ? ({ name:e, sets:[] }) : e)); }}>
                  <Text style={styles.btnText}>{hasWorkout ? 'Editar' : 'Montar'}</Text>
                </Pressable>
                {hasWorkout && (
                  <Pressable style={[styles.btn, styles.btnSecondary, { flex: 1 }]} onPress={() => deleteDay(item.key)}>
                    <Text style={[styles.btnText, styles.btnSecondaryText]}>Limpar</Text>
                  </Pressable>
                )}
              </View>
            </View>
          );
        }}
      />

      <Modal visible={!!openDay} animationType="slide" onRequestClose={() => setOpenDay(null)}>
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.h2}>Editar treino</Text>
            <Pressable onPress={() => setOpenDay(null)} style={[styles.btn, styles.btnSecondary]}><Text style={[styles.btnText, styles.btnSecondaryText]}>Fechar</Text></Pressable>
          </View>
          <View style={{ padding: 16, gap: 12 }}>
            <TextInput placeholder="Buscar exercício" value={query} onChangeText={setQuery} style={styles.input} />
            <ScrollView style={{ maxHeight: 160 }}>
              {filtered.map(name => (
                <Pressable key={name} onPress={() => {
                  setExerciseList(list => list.some(e => e.name === name) ? list : [...list, { name, sets: [] }]);
                }}>
                  <Text style={styles.small}>+ {name}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <Text style={styles.label}>Selecionados</Text>
            <ScrollView style={{ maxHeight: 260 }}>
              {exerciseList.map((ex, idx) => (
                <View key={ex.name} style={styles.exItem}>
                  <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
                    <Text style={styles.bold}>{ex.name}</Text>
                    <Pressable onPress={() => setExerciseList(list => list.filter((_,i)=>i!==idx))}><Text style={[styles.smallLink]}>Remover</Text></Pressable>
                  </View>
                  {(ex.sets || []).map((s, si) => (
                    <View key={si} style={styles.setBox}>
                      <Text style={styles.small}>Repetições</Text>
                      <TextInput keyboardType="number-pad" value={String(s.reps)} onChangeText={(t)=>{
                        const v = Number(t||0); setExerciseList(list => list.map((it,i)=> i===idx ? { ...it, sets: it.sets.map((ss,k)=> k===si ? { ...ss, reps: v } : ss) } : it));
                      }} style={styles.input} />
                      <Text style={styles.small}>Carga (kg)</Text>
                      <TextInput keyboardType="decimal-pad" value={String(s.weight)} onChangeText={(t)=>{
                        const v = Number(t||0); setExerciseList(list => list.map((it,i)=> i===idx ? { ...it, sets: it.sets.map((ss,k)=> k===si ? { ...ss, weight: v } : ss) } : it));
                      }} style={styles.input} />
                      <View style={{ alignItems:'flex-end' }}>
                        <Pressable onPress={() => setExerciseList(list => list.map((it,i)=> i===idx ? { ...it, sets: it.sets.filter((_,k)=>k!==si) } : it))}><Text style={styles.smallLink}>Remover série</Text></Pressable>
                      </View>
                    </View>
                  ))}
                  <View style={{ flexDirection:'row', gap:8 }}>
                    <Pressable onPress={() => setExerciseList(list => list.map((it,i)=> i===idx ? { ...it, sets: [...(it.sets||[]), { reps: 0, weight: 0 }] } : it))} style={[styles.btn, { alignSelf:'flex-start', flex:1 }]}>
                      <Text style={styles.btnText}>Adicionar série</Text>
                    </Pressable>
                    <Pressable onPress={async () => {
                      const ok = await persistCurrentDay().catch(()=>false);
                      if (ok) {
                        setSavedMap(m=>({ ...m, [ex.name]: Date.now() }));
                        notify('Exercício salvo');
                      } else {
                        notify('Falha ao salvar');
                      }
                    }} style={[styles.btn, styles.btnSecondary, { alignSelf:'flex-start', flex:1 }]}>
                      <Text style={[styles.btnText, styles.btnSecondaryText]}>Salvar exercício</Text>
                    </Pressable>
                  </View>
                  {savedMap[ex.name] && (
                    <Text style={[styles.small, styles.muted]}>Salvo</Text>
                  )}
                </View>
              ))}
            </ScrollView>

            <View style={{ flexDirection:'row', gap: 8, marginTop: 12 }}>
              <Pressable onPress={() => setOpenDay(null)} style={[styles.btn, styles.btnSecondary, { flex: 1 }]}><Text style={[styles.btnText, styles.btnSecondaryText]}>Cancelar</Text></Pressable>
              <Pressable onPress={saveDay} style={[styles.btn, { flex: 1 }]}><Text style={styles.btnText}>Salvar</Text></Pressable>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

  {toast && (
    <View style={{ position:'absolute', bottom:20, left:16, right:16, padding:12, borderRadius:8, backgroundColor: themeMode==='dark' ? '#1f2937' : '#111827' }}>
      <Text style={{ color:'#fff', textAlign:'center' }}>{toast}</Text>
    </View>
  )}
  <StatusBar style={themeMode==='dark' ? 'light' : 'dark'} />
    </SafeAreaView>
  );
}

