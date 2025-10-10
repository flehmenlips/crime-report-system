'use client'

import { useState, useEffect } from 'react'
import { User } from '@/types'

interface CaseDetailsProps {
  user: User
  onClose: () => void
}

interface CaseDetails {
  id: string
  caseName: string
  caseNumber: string
  dateReported: string
  dateOccurred: string
  location: string
  status: 'open' | 'investigating' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'critical'
  assignedOfficer: string
  description: string
  timeline: CaseEvent[]
  suspects: Suspect[]
  evidence: Evidence[]
  updates: CaseUpdate[]
  createdAt: string
  updatedAt: string
}

interface CaseEvent {
  id: string
  date: string
  time: string
  event: string
  description: string
  createdBy: string
  createdByName: string
  createdByRole: string
}

interface Suspect {
  id: string
  name: string
  description: string
  address?: string
  phone?: string
  status: 'active' | 'cleared' | 'arrested'
}

interface Evidence {
  id: string
  type: string
  description: string
  location: string
  collectedBy: string
  dateCollected: string
}

interface CaseUpdate {
  id: string
  date: string
  update: string
  createdBy: string
  createdByName: string
  createdByRole: string
}

const defaultCaseDetails: CaseDetails = {
  id: 'case-1',
  caseName: 'Birkenfeld Farm Theft Investigation',
  caseNumber: 'CC-2025-001234',
  dateReported: '2025-08-03',
  dateOccurred: '2024-03-10',
  location: '10640 Freeman Road, Birkenfeld, OR 97016',
  status: 'investigating',
  priority: 'high',
  assignedOfficer: 'Deputy Dave Brown',
  description: `Detailed Explanation of Property Theft Situation at 10640 Freeman Road, Birkenfeld, OR 97016

Dear Deputy Brown,

As requested in your response dated August 3, 2025, I am providing a comprehensive, chronological account of the circumstances surrounding the ongoing property theft at our farm and residence located at 10640 Freeman Road, Birkenfeld, Oregon 97016. This description includes details on the individuals involved, the timeline of events, the nature of our arrangement, evidence of theft, and our reasons for suspecting the former occupants.

Background and Initial Arrangement:
My wife, Rose Allred, and I (George Page) own and operate Sea Breeze Farm at the aforementioned address. From June to September 2023, we were commuting between the farm and Portland, where we were launching a farm-to-table restaurant and retail meat processing business (Coq au Vin) featuring products from our farm.

In early October 2023, during a visit to the farm, Rose encountered Cully Calvert and his family (collectively, the Calverts) working with livestock on an adjacent property. A conversation ensued, and we asked if they could occasionally check on our livestock when in the area, in exchange for nominal compensation. The Calverts agreed.

By early December 2023, we formalized an arrangement allowing the Calverts to reside in our farmhouse (which we were still using part-time) in exchange for their services. There was no written lease or rental contract; it was a verbal agreement based on mutual benefit.

The terms included:
- Caretaking of the farm and livestock
- Raising, harvesting, and delivering poultry, pork, lamb, beef and other farm products to our Portland location
- Transporting animals to the slaughterhouse twice per month
- Collecting processed meat from the slaughterhouse and delivering it to Portland twice per month
- Performing farm improvements, such as repairing fences, enhancing livestock facilities, and handling minor maintenance

We agreed to cover utilities, mortgage payments, livestock feed, and other farm-related expenses, with no cash rent required from the Calverts. The arrangement was intended to begin in late December 2023 and end by early 2025, no later than March 31, 2025, when we planned to return full-time.

At the start of this arrangement, our livestock inventory included approximately:
- 9 head of cattle
- 20 hogs
- 8 sheep
- 3 livestock guardian dogs

Developments in 2024:
By early 2024, the Calverts had fully moved into the farmhouse, and we no longer resided there, though we visited every few weeks to coordinate activities, harvest livestock, manage facilities, and collect inventory.

In January 2024, at our instruction, Cully Calvert sold the remaining cattle at a livestock auction, leaving only sheep, pigs, and dogs on the property.

Throughout the spring and summer of 2024, we provided the Calverts with thousands of dollars for feed and expenses via ACH bank drafts, paper checks, and a Capital One business credit card (receipts and bank records are available). Despite this, the Calverts repeatedly complained about insufficient funding. In hindsight, we believe they may have diverted these resources to their own livestock, as the feed expenditures far exceeded what was necessary for our reduced animal count.

By July-August 2024, the arrangement had deteriorated. No poultry was being raised, all cattle had been processed, and only a few dozen hogs and weaner piglets and several sheep remained. The Calverts delivered minimal product to our Portland operation (approximately $500 worth over the year) and made only two slaughterhouse trips, contrary to the twice-monthly agreement.

The Calverts grew antagonistic, refusing to transport livestock or supply products, which exacerbated our financial difficulties.

In late summer 2024, they became belligerent, refusing basic tasks and claiming we owed them substantial sums for services and purchases. We requested itemized details, but none were provided.

By September-October 2024, we notified the Calverts that the arrangement was ending, as we needed to return to the property under pressure from our bank to market and sell it. With few livestock left, their services were unnecessary, and we informed them that cash rent would be required if they wished to stay.

On October 28, 2024, we met the Calverts at the farmhouse to prepare two pieces of equipment—a 2019 KX057-4R3A Excavator (serial number: 30701) and a 2017 Kubota SSV-75 Skid Steer (serial number:11842) for consignment sale in order to generate cash to alleviate our financial struggles. Instead, the Calverts demanded payment for alleged debts, blockading the property exit to prevent equipment removal. Through intimidation (they were armed and threatening), they blackmailed and coerced us into agreeing that we "owed" them $32,000 and that they could take the excavator in lieu of payment. Fearing further loss or harm, we acquiesced, valuing the excavator at $55,000. The Calverts agreed to pay the $23,000 residual balance via $1,000 monthly installments, cover utilities (approximately $800/month), and pay rent aligned with our mortgage (~$5,000/month). No payments have ever been made.

Escalation and Eviction (November 2024 - July 2025):
From November-December 2024, we repeatedly communicated that their services were terminated, we were returning within 30 days, and we would list the property for sale. We offered consideration for vacating, but the Calverts resisted.

Between October 2024 and March 2025, they became hostile, denying us access, threatening violence (including with dogs and firearms), and obstructing contractors.

We removed our names from the West Oregon Electric account in early 2025, after which the Calverts accrued a $794 delinquency.

In January-February 2025, we engaged attorney Damon Petticord to initiate eviction under ORS 90.427(5)(c), filing a 90-day notice on February 27, 2025, with a June 1, 2025, eviction date.

In March 2025, we discovered evidence of theft. On March 10, 2025, during an attempt to retrieve our livestock guardian dogs and remaining sheep (which were missing), we noted the absence of household appliances (LG washer and dryer), poultry processing equipment, and DeWalt tools. An altercation ensued, prompting us to contact the Columbia County Sheriff's Office. We were advised that eviction proceedings must conclude before filing a report.

The Calverts did not vacate by June 1, 2025, leading to court proceedings (case number 25LT12325). A stipulated order required them to vacate the residence by July 8, 2025, and remove all belongings by July 22, 2025, with a mutual no-contact order.

On July 9, 2025, we regained access and began moving in. From July 9 to July 22, 2025, the Calverts frequently entered to remove their items and livestock. We observed them taking our belongings but could not intervene due to the no-contact order. We possess video documentation of some of these illegal removals.

After July 22, 2025, additional items vanished from remote areas (e.g., canoes on the riverbank, an electric farm cart in the driveway).

Recent Developments and Suspicions:
Since the final court-ordered date, we have observed and possess video records of the Calverts trespassing on the property. Specifically, on Saturday, August 16, 2025, we reported a trespass incident occurring at 11:57 a.m. to the Columbia County Sheriff's Office. This report was received by Deputy Nolan, and we had a subsequent phone conversation with her regarding the matter.

On August 17, 2025, we were visited at the 10640 Freeman Road location by Keith Tompkins, a field investigator for asset recovery associated with Falcon National Bank, through which we hold a loan for the KX057 excavator. He sought to recover the asset for the bank, and we provided him with information regarding the perpetrators and their possible locations. He obtained photographs of the property at 11060 Highway 202, Clatskanie, Oregon 97016, where the suspects appear to be residing. These photographs provide clear evidence of additional belongings from our farm, including unique objects that we purchased and to which the Calverts would have had no access other than through our property.

We believe the Calverts are responsible for the thefts based on:
- Their exclusive access to the property during the period when items began disappearing (early 2024 onward)
- Direct observations of them removing our items during the July 9-22, 2025, period
- Visual confirmation, including the recent photographs, of some belongings (e.g., fencing panels, water system components, unique custom fencing connectors, farm dogs, canoes, tools) at the nearby property they appear to occupy: 11060 Highway 202, Clatskanie, Oregon 97016

To our knowledge, the Calverts' current whereabouts are in the vicinity of Rainier, Oregon (potentially at 70510 Apiary Road, Rainier, OR 97048, based on public records), though we suspect they are using the aforementioned Highway 202 property for storage.

The attached inventory details stolen items, including serial numbers where available (e.g., for the Kubota excavator), estimated values, and last-seen dates. Items without serial numbers (e.g., livestock, fencing supplies) may be challenging to recover, as you noted, but photographs and receipts are provided for identification.

We request that this information be used to assign a case number, initiate a review, and proceed with an investigation if deemed criminal. Please advise on any additional steps or information required.

Thank you for your assistance in this matter.

Sincerely,
George Page
Sea Breeze Farm
10640 Freeman Road
Birkenfeld, Oregon 97016
Phone: 206.427.3396
Email: george@seabreeze.farm`,
  timeline: [
    {
      id: 'event-1',
      date: '2023-10-01',
      time: '14:00',
      event: 'Initial Contact',
      description: 'Rose encountered Cully Calvert and family working with livestock on adjacent property',
      createdBy: 'user-1',
      createdByName: 'George Page',
      createdByRole: 'property_owner'
    },
    {
      id: 'event-2',
      date: '2023-12-01',
      time: '09:00',
      event: 'Arrangement Formalized',
      description: 'Verbal agreement established for Calverts to reside in farmhouse in exchange for services',
      createdBy: 'user-1',
      createdByName: 'George Page',
      createdByRole: 'property_owner'
    },
    {
      id: 'event-3',
      date: '2024-01-15',
      time: '10:30',
      event: 'Cattle Sale',
      description: 'Remaining cattle sold at livestock auction per instruction',
      createdBy: 'user-1',
      createdByName: 'George Page',
      createdByRole: 'property_owner'
    },
    {
      id: 'event-4',
      date: '2024-07-01',
      time: '16:00',
      event: 'Deterioration Begins',
      description: 'Arrangement deteriorated - no poultry being raised, minimal product delivery',
      createdBy: 'user-1',
      createdByName: 'George Page',
      createdByRole: 'property_owner'
    },
    {
      id: 'event-5',
      date: '2024-10-28',
      time: '11:00',
      event: 'Equipment Incident',
      description: 'Calverts blockaded property exit, coerced agreement for excavator in lieu of alleged debt',
      createdBy: 'user-1',
      createdByName: 'George Page',
      createdByRole: 'property_owner'
    },
    {
      id: 'event-6',
      date: '2025-02-27',
      time: '14:00',
      event: 'Eviction Notice Filed',
      description: '90-day eviction notice filed with June 1, 2025 eviction date',
      createdBy: 'user-1',
      createdByName: 'George Page',
      createdByRole: 'property_owner'
    },
    {
      id: 'event-7',
      date: '2025-03-10',
      time: '09:30',
      event: 'Theft Discovered',
      description: 'Discovered missing appliances, equipment, and tools during property visit',
      createdBy: 'user-1',
      createdByName: 'George Page',
      createdByRole: 'property_owner'
    },
    {
      id: 'event-8',
      date: '2025-07-09',
      time: '08:00',
      event: 'Property Regained',
      description: 'Regained access to property after eviction order',
      createdBy: 'user-1',
      createdByName: 'George Page',
      createdByRole: 'property_owner'
    },
    {
      id: 'event-9',
      date: '2025-08-16',
      time: '11:57',
      event: 'Trespass Incident',
      description: 'Reported trespass incident to Columbia County Sheriff\'s Office',
      createdBy: 'user-1',
      createdByName: 'George Page',
      createdByRole: 'property_owner'
    },
    {
      id: 'event-10',
      date: '2025-08-17',
      time: '15:00',
      event: 'Asset Recovery Investigation',
      description: 'Keith Tompkins from Falcon National Bank investigated excavator location',
      createdBy: 'user-1',
      createdByName: 'George Page',
      createdByRole: 'property_owner'
    }
  ],
  suspects: [
    {
      id: 'suspect-1',
      name: 'Cully Calvert',
      description: 'Primary suspect - former farm caretaker with exclusive access to property during theft period',
      address: '11060 Highway 202, Clatskanie, OR 97016',
      status: 'active'
    },
    {
      id: 'suspect-2',
      name: 'Calvert Family',
      description: 'Collective family unit involved in farm arrangement and subsequent thefts',
      address: 'Potentially 70510 Apiary Road, Rainier, OR 97048',
      status: 'active'
    }
  ],
  evidence: [
    {
      id: 'evidence-1',
      type: 'Photographs',
      description: 'Photos of stolen items at suspect location (11060 Highway 202, Clatskanie, OR)',
      location: '11060 Highway 202, Clatskanie, OR 97016',
      collectedBy: 'Keith Tompkins',
      dateCollected: '2025-08-17'
    },
    {
      id: 'evidence-2',
      type: 'Video Documentation',
      description: 'Video records of illegal removals during July 9-22, 2025 period',
      location: '10640 Freeman Road, Birkenfeld, OR 97016',
      collectedBy: 'George Page',
      dateCollected: '2025-07-09'
    },
    {
      id: 'evidence-3',
      type: 'Financial Records',
      description: 'Bank records, receipts, and payment documentation',
      location: 'Digital/Physical Records',
      collectedBy: 'George Page',
      dateCollected: '2024-01-01'
    }
  ],
  updates: [
    {
      id: 'update-1',
      date: '2025-08-03',
      update: 'Initial case report submitted to Deputy Dave Brown',
      createdBy: 'user-1',
      createdByName: 'George Page',
      createdByRole: 'property_owner'
    },
    {
      id: 'update-2',
      date: '2025-08-17',
      update: 'Asset recovery investigation completed - evidence of stolen items at suspect location',
      createdBy: 'user-1',
      createdByName: 'George Page',
      createdByRole: 'property_owner'
    }
  ],
  createdAt: '2025-08-03T10:00:00Z',
  updatedAt: '2025-08-17T15:00:00Z'
}

export function CaseDetails({ user, onClose }: CaseDetailsProps) {
  const [caseDetails, setCaseDetails] = useState<CaseDetails>(defaultCaseDetails)
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'suspects' | 'evidence' | 'updates'>('overview')
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<Partial<CaseDetails>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canEdit = user.role === 'law_enforcement' || user.role === 'property_owner'

  const handleEdit = () => {
    setIsEditing(true)
    setEditForm(caseDetails)
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Simulate API call - in real implementation, this would save to database
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setCaseDetails(prev => ({ ...prev, ...editForm, updatedAt: new Date().toISOString() }))
      setIsEditing(false)
      setEditForm({})
    } catch (err) {
      setError('Failed to save case details')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditForm({})
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return '#3b82f6'
      case 'investigating': return '#f59e0b'
      case 'closed': return '#10b981'
      default: return '#6b7280'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return '#10b981'
      case 'medium': return '#f59e0b'
      case 'high': return '#ef4444'
      case 'critical': return '#dc2626'
      default: return '#6b7280'
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '24px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '20px',
          maxWidth: '1200px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
          padding: '32px',
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          color: 'white',
          position: 'relative',
          flexShrink: 0
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '24px',
              right: '24px',
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '12px',
              padding: '12px',
              cursor: 'pointer',
              color: 'white'
            }}
          >
            <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: '800', margin: '0 0 8px 0' }}>
                🏛️ Case Details
              </h1>
              <p style={{ margin: 0, opacity: 0.9, fontSize: '18px' }}>
                {caseDetails.caseName}
              </p>
            </div>
            
            {canEdit && (
              <div style={{ display: 'flex', gap: '12px' }}>
                {isEditing ? (
                  <>
                    <button
                      onClick={handleCancel}
                      disabled={loading}
                      style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '12px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        color: 'white',
                        fontWeight: '600',
                        fontSize: '14px'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      style={{
                        background: loading ? 'rgba(255, 255, 255, 0.3)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '12px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        color: 'white',
                        fontWeight: '600',
                        fontSize: '14px'
                      }}
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleEdit}
                    style={{
                      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      color: 'white',
                      fontWeight: '600',
                      fontSize: '14px'
                    }}
                  >
                    ✏️ Edit Case
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Case Info Bar */}
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ opacity: 0.8 }}>Case #:</span>
              <span style={{ fontWeight: '600' }}>{caseDetails.caseNumber}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ opacity: 0.8 }}>Status:</span>
              <span style={{ 
                fontWeight: '600',
                color: getStatusColor(caseDetails.status),
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '4px 8px',
                borderRadius: '6px'
              }}>
                {caseDetails.status.toUpperCase()}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ opacity: 0.8 }}>Priority:</span>
              <span style={{ 
                fontWeight: '600',
                color: getPriorityColor(caseDetails.priority),
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '4px 8px',
                borderRadius: '6px'
              }}>
                {caseDetails.priority.toUpperCase()}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ opacity: 0.8 }}>Officer:</span>
              <span style={{ fontWeight: '600' }}>{caseDetails.assignedOfficer}</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{
          background: '#f8fafc',
          borderBottom: '1px solid #e5e7eb',
          padding: '0 32px',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', gap: '0' }}>
            {[
              { id: 'overview', label: '📋 Overview', icon: '📋' },
              { id: 'timeline', label: '⏰ Timeline', icon: '⏰' },
              { id: 'suspects', label: '👤 Suspects', icon: '👤' },
              { id: 'evidence', label: '🔍 Evidence', icon: '🔍' },
              { id: 'updates', label: '📝 Updates', icon: '📝' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: '16px 24px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: activeTab === tab.id ? '#1f2937' : '#6b7280',
                  borderBottom: activeTab === tab.id ? '3px solid #3b82f6' : '3px solid transparent',
                  transition: 'all 0.2s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '32px' }}>
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Basic Information */}
              <div style={{
                background: '#f9fafb',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid #e5e7eb'
              }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937', marginBottom: '16px' }}>
                  📋 Case Information
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                      Case Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.caseName || caseDetails.caseName}
                        onChange={(e) => setEditForm(prev => ({ ...prev, caseName: e.target.value }))}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '2px solid #e5e7eb',
                          fontSize: '14px'
                        }}
                      />
                    ) : (
                      <p style={{ margin: 0, color: '#6b7280' }}>{caseDetails.caseName}</p>
                    )}
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                      Location
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.location || caseDetails.location}
                        onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '2px solid #e5e7eb',
                          fontSize: '14px'
                        }}
                      />
                    ) : (
                      <p style={{ margin: 0, color: '#6b7280' }}>{caseDetails.location}</p>
                    )}
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                      Date Reported
                    </label>
                    <p style={{ margin: 0, color: '#6b7280' }}>{formatDate(caseDetails.dateReported)}</p>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                      Date Occurred
                    </label>
                    <p style={{ margin: 0, color: '#6b7280' }}>{formatDate(caseDetails.dateOccurred)}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div style={{
                background: '#f9fafb',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid #e5e7eb'
              }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937', marginBottom: '16px' }}>
                  📝 Case Description
                </h3>
                
                {isEditing ? (
                  <textarea
                    value={editForm.description || caseDetails.description}
                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '2px solid #e5e7eb',
                      fontSize: '14px',
                      minHeight: '200px',
                      resize: 'vertical',
                      fontFamily: 'inherit'
                    }}
                  />
                ) : (
                  <div style={{
                    background: 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    maxHeight: '400px',
                    overflow: 'auto'
                  }}>
                    <p style={{ 
                      margin: 0, 
                      color: '#374151', 
                      lineHeight: '1.6',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {caseDetails.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937', marginBottom: '16px' }}>
                ⏰ Case Timeline
              </h3>
              
              {caseDetails.timeline.map((event, index) => (
                <div key={event.id} style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                  position: 'relative'
                }}>
                  <div style={{ display: 'flex', alignItems: 'start', gap: '16px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: '700',
                      fontSize: '16px',
                      flexShrink: 0
                    }}>
                      {index + 1}
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                          {event.event}
                        </h4>
                        <span style={{
                          background: '#f3f4f6',
                          color: '#6b7280',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {formatDate(event.date)} at {event.time}
                        </span>
                      </div>
                      
                      <p style={{ 
                        margin: '0 0 8px 0', 
                        color: '#374151', 
                        lineHeight: '1.5' 
                      }}>
                        {event.description}
                      </p>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          background: '#e5e7eb',
                          color: '#6b7280',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '600'
                        }}>
                          {event.createdByRole === 'property_owner' ? '👤' : '🚔'} {event.createdByName}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'suspects' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937', marginBottom: '16px' }}>
                👤 Suspects
              </h3>
              
              {caseDetails.suspects.map((suspect) => (
                <div key={suspect.id} style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div>
                      <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: '0 0 4px 0' }}>
                        {suspect.name}
                      </h4>
                      <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                        {suspect.description}
                      </p>
                    </div>
                    
                    <span style={{
                      background: suspect.status === 'active' ? '#fee2e2' : suspect.status === 'cleared' ? '#dcfce7' : '#fef3c7',
                      color: suspect.status === 'active' ? '#991b1b' : suspect.status === 'cleared' ? '#166534' : '#92400e',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '600',
                      textTransform: 'uppercase'
                    }}>
                      {suspect.status}
                    </span>
                  </div>
                  
                  {suspect.address && (
                    <div style={{ marginTop: '12px' }}>
                      <span style={{ fontWeight: '600', color: '#374151' }}>Address: </span>
                      <span style={{ color: '#6b7280' }}>{suspect.address}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'evidence' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937', marginBottom: '16px' }}>
                🔍 Evidence
              </h3>
              
              {caseDetails.evidence.map((evidence) => (
                <div key={evidence.id} style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div>
                      <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: '0 0 4px 0' }}>
                        {evidence.type}
                      </h4>
                      <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                        {evidence.description}
                      </p>
                    </div>
                    
                    <span style={{
                      background: '#e5e7eb',
                      color: '#6b7280',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {formatDate(evidence.dateCollected)}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '16px', fontSize: '14px' }}>
                    <div>
                      <span style={{ fontWeight: '600', color: '#374151' }}>Location: </span>
                      <span style={{ color: '#6b7280' }}>{evidence.location}</span>
                    </div>
                    <div>
                      <span style={{ fontWeight: '600', color: '#374151' }}>Collected by: </span>
                      <span style={{ color: '#6b7280' }}>{evidence.collectedBy}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'updates' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937', marginBottom: '16px' }}>
                📝 Case Updates
              </h3>
              
              {caseDetails.updates.map((update) => (
                <div key={update.id} style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{
                        background: update.createdByRole === 'property_owner' ? '#dbeafe' : '#fee2e2',
                        color: update.createdByRole === 'property_owner' ? '#1e40af' : '#991b1b',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <span>{update.createdByRole === 'property_owner' ? '👤' : '🚔'}</span>
                        <span>{update.createdByName}</span>
                      </span>
                    </div>
                    
                    <span style={{
                      background: '#f3f4f6',
                      color: '#6b7280',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {formatDate(update.date)}
                    </span>
                  </div>
                  
                  <p style={{ 
                    margin: 0, 
                    color: '#374151', 
                    lineHeight: '1.5' 
                  }}>
                    {update.update}
                  </p>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div style={{
              background: '#fee2e2',
              border: '1px solid #fecaca',
              borderRadius: '12px',
              padding: '12px 16px',
              marginBottom: '24px',
              color: '#991b1b',
              fontSize: '14px'
            }}>
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '24px 32px',
          borderTop: '1px solid #e5e7eb',
          background: '#f8fafc',
          borderBottomLeftRadius: '20px',
          borderBottomRightRadius: '20px',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              Last updated: {formatDateTime(caseDetails.updatedAt)}
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={onClose}
                style={{
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '16px'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
