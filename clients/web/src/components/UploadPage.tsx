import { useState } from "react"
import { useAuth } from "../App"

export default function UploadPage({ onBack }: { onBack: () => void }) {
  const { token } = useAuth()
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  async function upload() {
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)

    setLoading(true)

    const res = await fetch("/api/video/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    })

    setLoading(false)

    if (res.ok) {
      alert("Upload successful")
      onBack()
    } else {
      alert("Upload failed")
    }
  }

  return (
    <div style={{ padding: 40 }}>
      <h2>Upload Video</h2>

      <input
        type="file"
        accept="video/mp4"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />

      <br /><br />

      <button onClick={upload} disabled={!file || loading}>
        {loading ? "Uploading..." : "Upload"}
      </button>

      <br /><br />

      <button onClick={onBack}>
        Back
      </button>
    </div>
  )
}