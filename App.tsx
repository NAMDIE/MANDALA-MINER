
import React from 'react';
import { ConvexProvider } from "convex/react";
import { convex } from "./utils/convexClient";
import { RootNavigator } from "./navigation";

const App: React.FC = () => {
  return (
    <ConvexProvider client={convex}>
      <RootNavigator />
    </ConvexProvider>
  );
};

export default App;
