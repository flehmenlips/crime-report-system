export default function TestPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Test Page - Deployment Working</h1>
      <p>If you can see this page, the deployment is working.</p>
      <p>Current time: {new Date().toISOString()}</p>
      <p>This is a minimal test to verify deployment functionality.</p>
    </div>
  )
}
