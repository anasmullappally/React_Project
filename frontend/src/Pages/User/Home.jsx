import React from 'react'
import BottomMenu from '../../components/User/BottemMenu/BottomMenu';
import Header from '../../components/User/Header/Header';
import Main from '../../components/User/Main/Main';
function Home() {
  return (
    <div>
      <Header />
      <Main />
      <BottomMenu />
    </div>
  )
}

export default Home