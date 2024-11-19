// components/BusinessList.js
import React from "react";
import { Button, Card, CardContent, CardHeader, Grid, Typography } from "@mui/material";

const BusinessList = ({ businesses, onBusinessSelect }) => {
  return (
    <Card style={{ padding: 20 }}>
      <CardHeader title="Select a business" />
      <CardContent>
        <Grid container spacing={2}>
          {businesses.map((business) => (
            <Grid item key={business.BusinessID} xs={12} sm={6} md={4}>
              <Button variant="contained" fullWidth onClick={() => onBusinessSelect(business)}>
                {business.BusinessName}
              </Button>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default BusinessList;
