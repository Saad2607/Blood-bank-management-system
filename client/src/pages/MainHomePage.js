import React from 'react';
import Header from '../components/shared/Layout/Header';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const MainHomePage = () => {
    const {user} = useSelector(state => state.auth);
    const navigate = useNavigate();
    return (
        <>
            <Header />
            {/* {user?.role === 'organization' && navigate('/home')}
            {user?.role === 'admin' && navigate('/admin')}
            {user?.role === 'hospital' && navigate('/organization')}
            {user?.role === 'donar' && navigate('/organization')} */}
            <div>
                <div className="background">
                    <div className="color-overlay">
                        <div className="up" style={{ textAlign: 'center' }}>
                            <h3 style={{ display: 'block', color: 'white', fontSize: 40, textShadow: '1px 3px 5px black' }}><b>SAVING
                                LIVES, ONE DROP AT A TIME:
                                INTRODUCING<b /></b></h3><b><b><br />
                                    <h1 style={{ fontSize: 90, color: 'white', display: 'inline', WebkitTextStroke: '2px rgb(143, 12, 12)', textShadow: '1px 5px 9px black' }}>
                                        <b>PULSE </b>
                                    </h1>
                                    <h1 style={{ fontSize: 90, color: 'rgb(180, 20, 20)', display: 'inline', WebkitTextStroke: '1px rgb(255, 251, 251)', textShadow: '1px 5px 9px black' }}>
                                        <b>POINT</b>
                                    </h1><br />
                                    {/* <img src="bd.png" alt="" width="80px" align="center" style="border-radius: 50px; margin-left: 20px; border: 5px solid black;"><br> */}
                                    <br />
                                    <h3 style={{ color: 'antiquewhite', fontSize: 25, textShadow: '1px 3px 5px black' }}>A Blood Donation/ Blood
                                        Bank Website</h3><br />
                                </b></b></div><b><b><br />
                                    <div className="scroll-down-arrow">
                                        <span />
                                    </div>
                                </b></b></div><b><b>
                                </b></b></div><b><b>
                                    <div className="mission" style={{ border: '1px solid black', padding: '2%', margin: 10, borderRadius: 20, boxShadow: '1px 5px 8px black' }}>
                                        <h2 style={{ color: 'rgb(180, 20, 20)', marginBottom: 8 }}><b>OUR GOAL</b></h2>
                                        <h5 style={{ fontFamily: '"Franklin Gothic Medium", "Arial Narrow", Arial, sans-serif' }}>Our goal is to rally a
                                            lifesaving crew! We're aiming to recruit [Number] incredible blood donors in the next
                                            [Timeframe]. Every single person who steps up to donate makes a world of difference. By giving blood, you'll
                                            directly contribute to helping people in our community battling illness, facing surgery, or experiencing
                                            emergencies. It's a quick and painless process that can have a life-altering impact. Let's join forces to
                                            ensure hospitals have the blood they need to save lives!</h5>
                                    </div>
                                    <h1 style={{ textAlign: 'center', marginTop: 20, marginBottom: '0%', color: 'rgb(180, 20, 20)', textShadow: '1px 3px 5px black', fontSize: 60 }}>
                                        <b>
                                            <ul>OUR COLLABRATORS</ul>
                                        </b></h1><br />
                                    <div className="cards" style={{ display: 'flex', justifyContent: 'center', padding: 0, flexWrap: 'wrap' }}>
                                        <div className="card" style={{ width: '30rem', margin: 40, border: '4px solid black', borderRadius: 23, boxShadow: '1px 5px 8px black' }}>
                                            <img src="l1.jpg" className="card-img-top" alt="..." style={{ borderTopLeftRadius: 20, borderTopRightRadius: 20 }} />
                                            <div className="card-body">
                                                <h5 className="card-title">Zebronics Laboratory</h5>
                                                <p className="card-text">Some quick example text to build on the card title and make up the bulk of the
                                                    card's content.</p>
                                                <a href="#" className="btn btn-primary">Go somewhere</a>
                                            </div>
                                        </div>
                                        <div className="card" style={{ width: '30rem', margin: 40, border: '4px solid black', borderRadius: 23, boxShadow: '1px 5px 8px black' }}>
                                            <img src="l2.jpg" className="card-img-top" alt="..." style={{ borderTopLeftRadius: 20, borderTopRightRadius: 20 }} />
                                            <div className="card-body">
                                                <h5 className="card-title">Blood Point Hospital</h5>
                                                <p className="card-text">Some quick example text to build on the card title and make up the bulk of the
                                                    card's content.</p>
                                                <a href="#" className="btn btn-primary">Go somewhere</a>
                                            </div>
                                        </div>
                                        <div className="card" style={{ width: '30rem', margin: 40, border: '4px solid black', borderRadius: 23, boxShadow: '1px 5px 8px black' }}>
                                            <img src="l3.jpg" className="card-img-top" alt="..." style={{ borderTopLeftRadius: 20, borderTopRightRadius: 20 }} />
                                            <div className="card-body">
                                                <h5 className="card-title">Dr. Sufvan's Lab</h5>
                                                <p className="card-text">Some quick example text to build on the card title and make up the bulk of the
                                                    card's content.</p>
                                                <a href="#" className="btn btn-primary">Go somewhere</a>
                                            </div>
                                        </div>
                                    </div>
                                </b></b></div>

        </>
    );
};

export default MainHomePage;
