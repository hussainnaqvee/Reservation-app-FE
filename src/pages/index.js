// pages/index.js
"use client";
import React, { useState, useEffect } from "react";
import { Button, Box, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Card, CardHeader, CardContent, Typography } from "@mui/material";
import BusinessList from "../components/BusinessList";
import { useRouter } from "next/router";

const HomePage = () => {
  const router = useRouter();
  const [businessList, setBusinessList] = useState([]);
  useEffect(async () => {
    (async () => {
      const resp = await fetch("http://localhost:3001/business")
        .then((res) => res.json())
        .then((data) => {
          setBusinessList(data);
        });
    })();
  }, []);

  const [selectedBusiness, setSelectedBusiness] = useState(null);

  const handleBusinessSelect = (business) => {
    setSelectedBusiness(business);
    window.location.href = `/reservation?businessId=${business.BusinessID}`;
    // router.push(`/reservation?businessId=${business.BusinessID}`);
  };

  return (
    <div style={{ padding: 20 }}>
      <BusinessList businesses={businessList} onBusinessSelect={handleBusinessSelect} />
    </div>
  );
};

export default HomePage;
