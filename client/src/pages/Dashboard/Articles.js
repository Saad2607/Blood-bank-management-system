import React from 'react';
import Layout from '../../components/shared/Layout/Layout';
import { useSelector } from 'react-redux';

const Articles = () => {
    const { user } = useSelector(state => state.auth);
    return (
        <Layout>
            <div className='container'>
                <div className='d-flex flex-column mt-4'>
                    <h1>Welcome <i className='text-success'>{user?.name}</i></h1>
                    <h3>Here the Motivation for You</h3>
                    <hr />
                    <p>
                        🩸<strong> Article 1: The Gift of Life – Why Blood Donation Matters<br /></strong>
                        Blood donation is one of the most selfless and impactful acts a person can perform. Every time you donate blood, you have the potential to save up to three lives. From accident victims to patients undergoing surgeries, chemotherapy, or dealing with blood disorders like thalassemia — your blood is a lifeline.

                        Despite the constant demand, many hospitals and blood banks face shortages. This is why regular blood donors are heroes in disguise. They step up without expecting anything in return. The process is simple, safe, and takes less than an hour — yet the impact is eternal.

                        When you donate, you give someone a second chance, a family renewed hope, and a future restored.
                        Be that difference. Donate blood. Save lives.
                    </p>
                    <p className='mt-4'>
                        🩸<strong> Article 2: Blood Donation – A Small Act with a Big Impact <br/></strong>
                        Many of us wish we could do more to help others — to give back, to make a difference. Blood donation is one of the easiest and most powerful ways to do exactly that.

                        Think about this: someone in the world needs blood every two seconds. Your single donation could be the reason someone recovers from surgery, survives a traumatic accident, or wins a battle against cancer.

                        Moreover, regular blood donors often experience health benefits, including improved blood flow and reduced iron overload. But more than that, you feel connected to a bigger purpose — humanity.

                        So the next time you see a blood donation drive, don’t walk past it. Step forward and offer the most precious gift you have — the gift of life.
                    </p>
                    <p className='mt-4'>
                        🩸<strong> Article 3: Become a Lifesaver – The Call for Blood Donors <br /></strong>
                        In today’s fast-paced world, where technology and speed dominate our lives, it’s easy to overlook the simple acts of kindness that can truly change the world. Blood donation is one of those powerful acts.

                        There are no substitutes for human blood. Hospitals rely on the generosity of people like you. Whether it’s for a child with leukemia or a mother during childbirth complications, your donation can be the difference between life and death.

                        You don’t need to be rich or famous to be someone’s hero. All you need is the courage to care.
                        So, roll up your sleeve, take a deep breath, and know that you are doing something extraordinary.

                        Your blood can give someone another sunrise. Another hug. Another chance.
                    </p>
                </div>
            </div>
        </Layout >
    );
};

export default Articles;
