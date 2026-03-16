import { useState } from "react"
import { useAuth } from "../App"

export default function UploadVideo() {
  const { token } = useAuth()
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState("")

  async function upload() {
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)

    setLoading(true)
    setMsg("")

    try {
      const res = await fetch("/api/video/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      })

      if (!res.ok) {
        const txt = await res.text()
        throw new Error(txt)
      }

      setMsg("Upload successful!")
      setFile(null)

    } catch (err) {
      setMsg("Upload failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{position:"fixed", bottom:"20px", right:"20px", background:"#111", padding:"10px"}}>
      <input
        type="file"
        accept="video/mp4"
        onChange={(e)=>setFile(e.target.files?.[0] ?? null)}
      />

      <button onClick={upload} disabled={loading || !file}>
        {loading ? "Uploading..." : "Upload"}
      </button>

      {msg && <div>{msg}</div>}
    </div>
  )
}