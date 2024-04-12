import * as fs from 'fs';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import * as path from 'path';

// Ruta al archivo de video que quieres subir
const videoPath = path.join(__dirname, '../test/videos/test_video.mp4');

// Título y descripción del video
const title = 'Test de subida de video con script';
const description = 'Este es una prueba para subir videos con script';

// Función para subir el video a YouTube
export function uploadVideo(auth: OAuth2Client) {
  const service = google.youtube('v3');
  const res = service.videos.insert({
    auth,
    part: ['snippet', 'status'],
    requestBody: {
      snippet: {
        title,
        description,
      },
      status: {
        privacyStatus: 'private',
      },
    },
    media: {
      body: fs.createReadStream(videoPath),
    },
  }, (err, response) => {
    if (err) {
      console.error('Error al subir el video:', err);
    }
    const videoId = response!.data.id;
    console.log('Video subido con éxito. ID del video:', videoId);
  });
}

