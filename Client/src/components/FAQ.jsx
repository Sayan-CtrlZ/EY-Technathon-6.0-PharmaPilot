import React, { useState } from 'react'

const FAQ = () => {
  const [expandedIndex, setExpandedIndex] = useState(0)

  const faqs = [
    {
      category: 'Capabilities',
      questions: [
        {
          q: 'What types of research queries can PharmaPilot handle?',
          a: 'PharmaPilot excels at molecule research, disease analysis, market intelligence, competitive landscape, regulatory pathways, safety profiles, formulation insights, patent analysis, and clinical trial data synthesis. Ask anything pharmaceutical-related and our agents will work together to deliver comprehensive answers.'
        },
        {
          q: 'How accurate are the insights provided?',
          a: 'PharmaPilot maintains 98%+ citation accuracy by cross-referencing multiple authoritative sources including clinical trials databases, FDA records, EMA documents, and peer-reviewed publications. All findings are traced back to original sources.'
        },
        {
          q: 'Can PharmaPilot handle proprietary or confidential data?',
          a: 'Yes. PharmaPilot supports private document uploads and can analyze your proprietary data alongside public databases. All proprietary data remains encrypted and isolated within your workspace.'
        }
      ]
    },
    {
      category: 'Data & Sources',
      questions: [
        {
          q: 'What databases and sources does PharmaPilot access?',
          a: 'We index: FDA CBER/CDER/CDRH databases, EMA European Medicines Agency records, PubMed (5M+ publications), ClinicalTrials.gov (500K+ trials), USPTO Patents (2M+ drug-related patents), WHO databases, and specialized pharmacological literature.'
        },
        {
          q: 'How frequently is the database updated?',
          a: 'Core databases update daily. Clinical trial data syncs weekly. Patent databases update monthly. We also monitor real-time feeds for FDA approvals, adverse event reports, and regulatory updates.'
        },
        {
          q: 'What is the geographic coverage?',
          a: 'PharmaPilot covers FDA (US), EMA (Europe), PMDA (Japan), CDSCO (India), TGA (Australia), Health Canada, and 45+ other national regulatory bodies with localized data and approval pathways.'
        }
      ]
    },
    {
      category: 'Usage & Workflow',
      questions: [
        {
          q: 'How do I export results?',
          a: 'Results can be exported as PDFs, PowerPoint presentations, CSV/Excel files, or integrated directly into your systems via API. The Medical Writing Agent can also format outputs for publications, posters, or regulatory submissions.'
        },
        {
          q: 'Can multiple team members collaborate on research?',
          a: 'Yes. PharmaPilot supports team workspaces where multiple users can collaborate, share findings, create project folders, and maintain research histories with full audit trails.'
        },
        {
          q: 'How long do responses typically take?',
          a: 'Most queries return initial results in 3-5 seconds. Complex analyses with deep searches across multiple agents may take 10-30 seconds. All results are then refined with source citations and evidence scoring.'
        }
      ]
    },
    {
      category: 'Security & Compliance',
      questions: [
        {
          q: 'Is my data secure?',
          a: 'All data is encrypted in transit (TLS 1.3) and at rest (AES-256). PharmaPilot is HIPAA-compliant, SOC 2 Type II certified, and undergoes regular security audits. We never share user data with third parties.'
        },
        {
          q: 'What compliance standards does PharmaPilot meet?',
          a: 'We comply with HIPAA, GDPR, FDA 21 CFR Part 11, ISO 27001, and AICPA SOC 2 Type II. For regulated submissions, we provide compliance documentation and audit trails.'
        },
        {
          q: 'Can results be used in regulatory submissions?',
          a: 'Yes. PharmaPilot provides fully traceable, cited results suitable for regulatory submissions. We provide compliance documentation, source verification, and audit trails as required by FDA and EMA.'
        }
      ]
    },

  ]

  return (
    <section id='faq' className='w-full py-20 bg-white dark:bg-[#0a0a0a] border-t-2 border-emerald-300 dark:border-gray-800'>
      <div className='max-w-5xl mx-auto px-6'>
        <div className='text-center mb-16'>
          <h2 className='text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4'>
            Frequently Asked Questions
          </h2>
          <p className='text-lg text-gray-600 dark:text-gray-300'>
            Everything you need to know about PharmaPilot
          </p>
        </div>

        <div className='space-y-6'>
          {faqs.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              <h3 className='text-2xl font-bold text-gray-900 dark:text-white mb-4 pb-3 border-b-2 border-emerald-300 dark:border-emerald-800'>
                {section.category}
              </h3>
              <div className='space-y-3'>
                {section.questions.map((item, qIndex) => {
                  const globalIndex = sectionIndex * 10 + qIndex
                  return (
                    <div
                      key={globalIndex}
                      className='rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden'
                    >
                      <button
                        onClick={() => setExpandedIndex(expandedIndex === globalIndex ? -1 : globalIndex)}
                        className='w-full p-4 text-left bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 flex items-center justify-between'
                      >
                        <span className='font-semibold text-gray-900 dark:text-white'>
                          {item.q}
                        </span>
                        <span className='text-emerald-600 dark:text-emerald-400 text-xl'>
                          {expandedIndex === globalIndex ? '−' : '+'}
                        </span>
                      </button>

                      {expandedIndex === globalIndex && (
                        <div className='p-4 bg-white dark:bg-[#1a1a1a] border-t border-gray-200 dark:border-gray-700'>
                          <p className='text-gray-700 dark:text-gray-300 leading-relaxed'>
                            {item.a}
                          </p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <div className='mt-16 p-8 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 border border-emerald-200 dark:border-emerald-800 text-center'>
          <h3 className='text-xl font-bold text-gray-900 dark:text-white mb-2'>
            Didn't find your answer?
          </h3>
          <p className='text-gray-700 dark:text-gray-300 mb-4'>
            Contact our support team - we're here to help!
          </p>
          <button className='px-6 py-2 rounded-md bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors'>
            Get Support
          </button>
        </div>
      </div>
    </section>
  )
}

export default FAQ
