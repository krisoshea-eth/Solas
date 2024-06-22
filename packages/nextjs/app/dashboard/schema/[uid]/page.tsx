'use client'
import React, { useState, useEffect } from "react";
import { useRouter,useSearchParams } from "next/navigation";
import { fetchSchema,Schema } from "~~/utils/utils";



  export default function AttestationPage({ params }: { params: { uid: string } }) {
     const uid = params.uid;
     const [schema, setSchema] = useState<Schema | null>(null);
  
    useEffect(() => {
      console.log('UUID:', uid);
      if (uid) {
        fetchSchema(uid)
          .then(data => {
            console.log('Fetched data:', data);
            setSchema(data);
          })
          .catch(error => {
            console.error('Error fetching schema:', error);
          });
      }
    }, [uid]);
  
    if (!schema) {
      return <div>Loading...</div>;
    } 
  
    return (
      <div className="attestation-container p-6 shadow-md rounded-lg bg-[#E9E9F6]">
      <div className="mb-4">
        <span className="block text-sm text-gray-600">UID:</span>
        <span className="block text-lg font-semibold text-gray-600">{schema.uid}</span>
      </div>
      <div className="border rounded-md overflow-hidden">
        <table className="min-w-full bg-white">
          <tbody>
          <tr className="border-b">
              <td className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50">UID</td>
              <td className="px-4 py-2 text-sm text-gray-900">{schema.uid ? 'True' : 'False'}</td>
            </tr>

            <tr className="border-b">
              <td className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50">Schema</td>
              <td className="px-4 py-2 text-sm text-gray-900">{schema.schema}</td>
            </tr>
            <tr className="border-b">
              <td className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50">Attestations</td>
              <td className="px-4 py-2 text-sm text-gray-900">{schema.attestations ? 'True' : 'False'}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    );
  };
  
  