/**
 * Serviço de integração com a Google Drive API v3 (Upload Multipart e Geração de Links)
 */
export async function uploadPdfToGoogleDrive(
  file: File,
  accessToken: string,
  folderId: string
): Promise<{ driveFileId: string; viewUrl: string; downloadUrl: string }> {
  const metadata = {
    name: file.name,
    mimeType: 'application/pdf',
    parents: folderId ? [folderId] : undefined,
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', file);

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: form,
    }
  );

  if (!response.ok) {
    throw new Error(`Falha no upload para o Google Drive: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    driveFileId: data.id,
    viewUrl: `https://drive.google.com/file/d/${data.id}/preview`,
    downloadUrl: `https://drive.google.com/uc?export=download&id=${data.id}`,
  };
}
