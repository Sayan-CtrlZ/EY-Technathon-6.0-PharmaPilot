import React from 'react'
import NavBar from '../components/NavBar'
import Hero from '../components/Hero'
import HowItWorks from '../components/HowItWorks'
import StatsSection from '../components/StatsSection'
import ChallengeOverview from '../components/ChallengeOverview'
import DataSourcesIntegration from '../components/DataSourcesIntegration'
import UseCases from '../components/UseCases'
import WorkflowAnimation from '../components/WorkflowAnimation'
import FAQ from '../components/FAQ'
import Footer from '../components/Footer'

const Home = () => {
  return (
    <div className='flex flex-col bg-linear-to-b from-[#d1fae5] via-[#a7f3d0] to-[#f0fdf4] dark:bg-linear-to-b dark:from-[#242124] dark:to-[#000000]'>
      <NavBar />
      <Hero />
      <WorkflowAnimation />
      <ChallengeOverview />
      <HowItWorks />
      <DataSourcesIntegration />
      <UseCases />
      <StatsSection />
      <FAQ />
      <Footer />
    </div>
  )
}

export default Home
