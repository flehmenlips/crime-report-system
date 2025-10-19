'use client'

export default function LandingPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #3b82f6 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255, 255, 255, 0.15) 1px, transparent 0)`,
        backgroundSize: '48px 48px',
        opacity: 0.3
      }} />

      {/* Content */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '80px 24px'
      }}>
        
        {/* Header */}
        <header style={{
          textAlign: 'center',
          marginBottom: '80px'
        }}>
          <div style={{
            display: 'inline-block',
            padding: '12px 24px',
            background: 'rgba(255, 255, 255, 0.15)',
            borderRadius: '50px',
            marginBottom: '24px'
          }}>
            <span style={{
              fontSize: '48px',
              marginRight: '12px'
            }}>🛡️</span>
          </div>
          
          <h1 style={{
            fontSize: '72px',
            fontWeight: 'bold',
            color: 'white',
            margin: '0 0 12px 0',
            lineHeight: '1.1',
            letterSpacing: '0.02em'
          }}>
            REMISE
          </h1>
          
          <h2 style={{
            fontSize: '42px',
            fontWeight: '600',
            color: 'rgba(255, 255, 255, 0.95)',
            margin: '0 0 32px 0',
            lineHeight: '1.2'
          }}>
            Asset Barn
          </h2>

          <p style={{
            fontSize: '24px',
            color: 'rgba(255, 255, 255, 0.9)',
            maxWidth: '700px',
            margin: '0 auto 48px auto',
            lineHeight: '1.6'
          }}>
            A secure repository barn for tracking all of your valuable assets and belongings
          </p>

          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <a
              href="/login-simple"
              style={{
                display: 'inline-block',
                padding: '16px 32px',
                background: 'white',
                color: '#1e3a8a',
                fontWeight: '600',
                fontSize: '18px',
                borderRadius: '12px',
                textDecoration: 'none',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
                transition: 'all 0.3s ease'
              }}
            >
              Sign In →
            </a>
            
            <a
              href="#features"
              style={{
                display: 'inline-block',
                padding: '16px 32px',
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontWeight: '600',
                fontSize: '18px',
                borderRadius: '12px',
                textDecoration: 'none',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                transition: 'all 0.3s ease'
              }}
            >
              Learn More
            </a>
          </div>
        </header>

        {/* Features Section */}
        <section id="features" style={{
          marginTop: '100px'
        }}>
          <h3 style={{
            fontSize: '36px',
            fontWeight: 'bold',
            color: 'white',
            textAlign: 'center',
            marginBottom: '60px'
          }}>
            Why Choose REMISE Asset Barn?
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '32px'
          }}>
            {/* Feature Cards */}
            {[
              {
                icon: '🔒',
                title: 'Bank-Grade Security',
                description: 'Industry-standard encryption, secure password hashing, and comprehensive audit logging protect your data.'
              },
              {
                icon: '📊',
                title: 'Complete Asset Tracking',
                description: 'Track all your valuable assets, from vehicles to equipment, with detailed records, photos, and documentation.'
              },
              {
                icon: '👮',
                title: 'Law Enforcement Ready',
                description: 'CJIS-compliant security standards and complete chain of custody tracking for evidence and reports.'
              },
              {
                icon: '📸',
                title: 'Evidence Management',
                description: 'Upload photos, documents, and videos with automatic organization and secure cloud storage.'
              },
              {
                icon: '🔍',
                title: 'Advanced Search',
                description: 'Powerful search and filtering capabilities to quickly find any asset or piece of evidence.'
              },
              {
                icon: '👥',
                title: 'Multi-User Access',
                description: 'Role-based access control for property owners, law enforcement, insurance agents, and stakeholders.'
              }
            ].map((feature, index) => (
              <div
                key={index}
                style={{
                  padding: '32px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                <div style={{
                  fontSize: '48px',
                  marginBottom: '16px'
                }}>
                  {feature.icon}
                </div>
                <h4 style={{
                  fontSize: '22px',
                  fontWeight: '600',
                  color: 'white',
                  marginBottom: '12px'
                }}>
                  {feature.title}
                </h4>
                <p style={{
                  fontSize: '16px',
                  color: 'rgba(255, 255, 255, 0.8)',
                  lineHeight: '1.6',
                  margin: 0
                }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Use Cases Section */}
        <section style={{
          marginTop: '100px',
          padding: '60px',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          textAlign: 'center'
        }}>
          <h3 style={{
            fontSize: '36px',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '32px'
          }}>
            Perfect For
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '24px',
            marginTop: '40px'
          }}>
            {[
              '🏡 Property Owners',
              '👮 Law Enforcement',
              '🏢 Insurance Agencies',
              '🏦 Banking & Finance',
              '🚜 Farm & Ranch Operations',
              '🏗️ Construction Companies'
            ].map((useCase, index) => (
              <div
                key={index}
                style={{
                  padding: '24px',
                  background: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  fontSize: '18px',
                  fontWeight: '600',
                  color: 'white'
                }}
              >
                {useCase}
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section style={{
          marginTop: '100px',
          textAlign: 'center'
        }}>
          <h3 style={{
            fontSize: '42px',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '24px'
          }}>
            Ready to Secure Your Assets?
          </h3>
          
          <p style={{
            fontSize: '20px',
            color: 'rgba(255, 255, 255, 0.9)',
            marginBottom: '40px'
          }}>
            Join property owners and law enforcement agencies using REMISE Asset Barn
          </p>

          <a
            href="/login-simple"
            style={{
              display: 'inline-block',
              padding: '20px 48px',
              background: 'white',
              color: '#1e3a8a',
              fontWeight: '700',
              fontSize: '20px',
              borderRadius: '12px',
              textDecoration: 'none',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
              transition: 'all 0.3s ease'
            }}
          >
            Get Started Today →
          </a>
        </section>

        {/* Footer */}
        <footer style={{
          marginTop: '100px',
          paddingTop: '40px',
          borderTop: '1px solid rgba(255, 255, 255, 0.2)',
          textAlign: 'center',
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '14px'
        }}>
          <p>© 2024 REMISE Asset Barn. All rights reserved.</p>
          <p style={{ marginTop: '8px' }}>
            Built with industry-standard security for law enforcement and asset management.
          </p>
        </footer>
      </div>
    </div>
  )
}

