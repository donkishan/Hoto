import { environment } from "../../environments/environment";

export function openSecureFile(
  dynamicPath: string,
  type: 'view' | 'download' = 'view'
) {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    alert('You are not logged in.');
    return;
  }

  const baseUrl = environment.apiUrl; 

  // alert(dynamicPath);

  const apiUrl = `${baseUrl}/files?path=${encodeURIComponent(dynamicPath)}`;
  const headers = new Headers({ Authorization: `Bearer ${token}` });

  fetch(apiUrl, { headers })
    .then(async (res) => {
      if (!res.ok) throw new Error('Unauthorized or file not found');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      if (type === 'download') {
        const a = document.createElement('a');
        a.href = url;
        a.download = dynamicPath.split('/').pop() || 'file';
        a.click();
        URL.revokeObjectURL(url);
      } else {
        window.open(url, '_blank');
      }
    })
    .catch(() => {
      alert('Unable to access file. You may be logged out.');
    });
}
