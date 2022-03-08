/**
 * @prettier
 */
import { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router';
import { useGetResults } from '../../components/hooks/get-results';
import Loading from '../../components/Loading';
import { Link, useNavigate } from 'react-router-dom';
import Electioneth from '../../ethereum/election';
import AuthContext from '../../store/auth-context';
import ShowResult from './ShowResult';
const SingleResult = () => {
   const [loading, setLoading] = useState(false);
   const [isDraw, setIsDraw] = useState(false);
   const [electionName, setElectionName] = useState('');
   const [candidates, setCandidates] = useState([]);
   const [candidateCount, setCount] = useState(0);
   const { address } = useParams();
   const { notify, results } = useContext(AuthContext);
   const navigate = useNavigate();

   useGetResults(setLoading);

   useEffect(() => {
      const b = async () => {
         //try{
         console.log(notify);
         setLoading(true);
         //First check if address by user is from our current election
         if (!results.includes(address)) {
            navigate(-1);
            notify('Wrong address', 'error');
         } else {
            try {
               const Election = Electioneth(address);
               //getting candidate count
               let count = await Election.methods.candidateCount().call();
               setCount(+count);

               //getting election name
               let name = await Election.methods.electionName().call();
               setElectionName(name);

               //getting all candidates and storing in one variable
               let tempCandidate = await Promise.all(
                  Array(+count)
                     .fill(1)
                     .map((element, index) => {
                        return Election.methods.candidates(index).call();
                     })
               );
               console.log(tempCandidate[0]);
               //sort tempCandidates
               tempCandidate.sort((a, b) => b.votes - a.votes);
               //checking for draw
               if (+count >= 2 && +tempCandidate[0].votes === +tempCandidate[1].votes) {
                  setIsDraw(true);
               }

               setCandidates(tempCandidate);
            } catch (err) {
               notify(err.message, 'error');
            }
         }

         setLoading(false);
      };
      b();
      return () => b;
   }, []);
   return (
      <>
         {loading && <Loading />}
         {!loading && candidateCount === 0 && <p>No candidates found</p>}
         {!loading && candidateCount > 0 && (
            <div className='flex flex-col mt-5 overflow-x-hidden overflow-y-hidden'>
               <div className='-my-2 overflow-x-auto sm:px-4 sm:-mx-6 lg:px-8'>
                  <div className='py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8'>
                     <div>
                        <h2 className='mt-5 text-center text-3xl font-bold mb-8 text-gray-900'>
                           {electionName}
                        </h2>
                     </div>
                     <div className='shadow overflow-hidden border-b border-gray-200 sm:rounded-lg'>
                        <table className='min-w-full divide-y divide-gray-300 overflow-x-scroll '>
                           <thead className='bg-indigo-500'>
                              <tr>
                                 <th
                                    scope='col'
                                    className='px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider'
                                 >
                                    Name
                                 </th>

                                 <th
                                    scope='col'
                                    className='px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider'
                                 >
                                    Votes
                                 </th>
                                 <th
                                    scope='col'
                                    className='px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider'
                                 >
                                    Rank
                                 </th>
                                 <th
                                    scope='col'
                                    className='px-2 py-3 text-left text-xs font-medium text-white uppercase tracking-wider'
                                 >
                                    Result
                                 </th>
                              </tr>
                           </thead>
                           <tbody className='bg-white divide-y divide-gray-200'>
                              {candidates.map((candidate, index) => (
                                 <ShowResult
                                    key={index}
                                    id={index}
                                    candidate={candidate}
                                    isDraw={isDraw}
                                 />
                              ))}
                           </tbody>
                        </table>
                     </div>
                     <button className='border border-transparent py-2 mt-5 w-40 rounded-md text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed'>
                        <Link to='/results'> All results</Link>
                     </button>
                  </div>
               </div>
            </div>
         )}
      </>
   );
};

export default SingleResult;
