CREATE MIGRATION m1fkg3xncqy2o7ktflxdyim7nz573awxfwcqxgbwhjxarusgacq3bq
    ONTO m1xjpvtbgjlnuqlp2vh2lbggcpqxrjoffpw3s4unw6pz3qzyuhq2cq
{
  CREATE TYPE default::ToyStatus {
      CREATE REQUIRED PROPERTY enabled -> std::bool;
  };
};
