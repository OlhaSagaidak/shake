import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

type Result = { answer: string; model_ms: number; total_ms: number };

export default function App() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function pick(fromCamera: boolean) {
    setError(null);
    setResult(null);
    if (fromCamera) {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) return setError('Camera permission is needed to take a photo.');
    }
    const options: ImagePicker.ImagePickerOptions = { mediaTypes: 'images', quality: 0.5, base64: true };
    const res = fromCamera
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);
    if (res.canceled || !res.assets?.length) return;
    const asset = res.assets[0];
    setPhoto(asset.uri);
    // On web the base64 can be missing; the uri is then a data: URL.
    const base64 = asset.base64 ?? asset.uri.split(',')[1];
    await analyze(base64, asset.mimeType ?? 'image/jpeg');
  }

  async function analyze(image_base64: string, mime_type: string) {
    if (!BACKEND_URL) return setError('EXPO_PUBLIC_BACKEND_URL is not set in app/.env');
    setLoading(true);
    const start = Date.now();
    try {
      const resp = await fetch(`${BACKEND_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_base64, mime_type }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.detail ?? `HTTP ${resp.status}`);
      setResult({ answer: data.answer, model_ms: data.model_ms, total_ms: Date.now() - start });
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Shake</Text>
      <Text style={styles.subtitle}>Send a dog photo to the coach</Text>
      <View style={styles.row}>
        <Pressable style={styles.button} onPress={() => pick(true)} disabled={loading}>
          <Text style={styles.buttonText}>Take photo</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => pick(false)} disabled={loading}>
          <Text style={styles.buttonText}>Choose photo</Text>
        </Pressable>
      </View>
      {photo && <Image source={{ uri: photo }} style={styles.photo} resizeMode="contain" />}
      {loading && <ActivityIndicator size="large" />}
      {result && (
        <View style={styles.card}>
          <Text style={styles.answer}>{result.answer}</Text>
          <Text style={styles.timing}>
            Round trip {result.total_ms} ms · model {result.model_ms} ms
          </Text>
        </View>
      )}
      {error && <Text style={styles.error}>{error}</Text>}
      <StatusBar style="auto" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: 'center', padding: 24, paddingTop: 72, gap: 16, backgroundColor: '#fff' },
  title: { fontSize: 32, fontWeight: '700' },
  subtitle: { fontSize: 16, color: '#555' },
  row: { flexDirection: 'row', gap: 12 },
  button: { backgroundColor: '#2f6fed', paddingVertical: 12, paddingHorizontal: 18, borderRadius: 10 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  photo: { width: '100%', height: 280, borderRadius: 12 },
  card: { width: '100%', backgroundColor: '#f2f5fb', padding: 16, borderRadius: 12, gap: 8 },
  answer: { fontSize: 16, lineHeight: 22 },
  timing: { fontSize: 13, color: '#666' },
  error: { color: '#c62828', fontSize: 14 },
});
