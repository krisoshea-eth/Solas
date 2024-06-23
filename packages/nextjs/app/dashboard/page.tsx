"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
const Dashboard = () => {
  return (
    <div>
      <div className="p-4">
        <p>Welcome to Dashboard!</p>
        <Link href="/dashboard/attestations">Attestations</Link>
        <br></br>
        <br></br>
        <Link href="/dashboard/schemas">Schemas</Link>
      </div>
    </div>
  );
};

export default Dashboard;
