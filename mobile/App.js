import React, { useEffect, useState, useMemo } from 'react';
import { SafeAreaView, View, Text, TextInput, Pressable, FlatList, Modal, ScrollView, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';

const daysOfWeek = [
  { key: 'mon', name: 'Segunda' },
  { key: 'tue', name: 'Terça' },
  { key: 'wed', name: 'Quarta' },
  { key: 'thu', name: 'Quinta' },
  { key: 'fri', name: 'Sexta' },
  { key: 'sat', name: 'Sábado' },
  { key: 'sun', name: 'Domingo' },
];

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem('academia_pro_user');
      if (raw) setUser(JSON.parse(raw));
    })();
  }, []);

  if (!user) return <LoginScreen onAuthenticated={setUser} loading={loading} setLoading={setLoading} />;
  return <PlannerScreen user={user} onLogout={() => { AsyncStorage.multiRemove(['academia_pro_token','academia_pro_user']); setUser(null); }} />
}

function LoginScreen({ onAuthenticated, loading, setLoading }) {
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
        <Text style={styles.h1}>Academia Pro</Text>
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
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

function PlannerScreen({ user, onLogout }) {
  const [plan, setPlan] = useState({});
  const [openDay, setOpenDay] = useState(null);
  const [exerciseList, setExerciseList] = useState([]);
  const [allExercises, setAllExercises] = useState([]);
  const [query, setQuery] = useState('');

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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.h2}>Academia Pro</Text>
        <View style={{ flexDirection:'row', alignItems:'center', gap: 8 }}>
          <Text style={styles.muted}>{user?.email}</Text>
          <Pressable onPress={onLogout} style={[styles.btn, styles.btnSecondary]}><Text style={[styles.btnText, styles.btnSecondaryText]}>Sair</Text></Pressable>
        </View>
      </View>

      <FlatList
        contentContainerStyle={{ padding: 16, gap: 12 }}
        data={daysOfWeek}
        keyExtractor={i=>i.key}
        numColumns={2}
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
                  <Pressable onPress={() => setExerciseList(list => list.map((it,i)=> i===idx ? { ...it, sets: [...(it.sets||[]), { reps: 0, weight: 0 }] } : it))} style={[styles.btn, { alignSelf:'flex-start' }]}>
                    <Text style={styles.btnText}>Adicionar série</Text>
                  </Pressable>
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

      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:'#f8fafc' },
  containerCenter: { flex:1, alignItems:'center', justifyContent:'center', padding:16, backgroundColor:'#f8fafc' },
  header: { padding:16, borderBottomWidth:1, borderBottomColor:'#e5e7eb', backgroundColor:'#fff', flexDirection:'row', alignItems:'center', justifyContent:'space-between' },
  card: { backgroundColor:'#fff', borderWidth:1, borderColor:'#e5e7eb', borderRadius:12, padding:12 },
  h1: { fontSize:24, fontWeight:'700' },
  h2: { fontSize:20, fontWeight:'700' },
  dayCard: { width: '48%', margin: '1%' },
  dayHeader: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:6 },
  dayTitle: { fontSize:16, fontWeight:'600' },
  dayExercises: { marginTop:6 },
  statusDot: { width:10, height:10, borderRadius:10 },
  input: { borderWidth:1, borderColor:'#d1d5db', borderRadius:8, paddingHorizontal:10, paddingVertical:10, backgroundColor:'#fff', marginTop:4 },
  label: { fontSize:12, color:'#6b7280', marginTop:8 },
  btn: { backgroundColor:'#2563eb', paddingVertical:10, paddingHorizontal:14, borderRadius:8, alignItems:'center', justifyContent:'center' },
  btnText: { color:'#fff', fontWeight:'600' },
  btnSecondary: { backgroundColor:'#e5e7eb' },
  btnSecondaryText: { color:'#111827' },
  small: { fontSize:12, color:'#374151' },
  smallLink: { fontSize:12, color:'#2563eb', marginTop:8 },
  muted: { color:'#6b7280' },
  row: { flexDirection:'row', gap: 8, marginTop: 12 },
  exItem: { borderWidth:1, borderColor:'#e5e7eb', borderRadius:8, padding:10, marginBottom:10 },
  bold: { fontWeight:'600' },
  setBox: { borderWidth:1, borderColor:'#e5e7eb', borderRadius:8, padding:10, marginTop:8 },
});
