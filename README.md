USER GUIDE:

  1) Home Screen
     A) Create Dashboard - Opens a new dashboard. To start creating widgets Login via nav bar, then upload GeoJSON datasets
     B) Load a Dashboard - click one of the existing dashboards to open dashboard view
     
  2) Dashboard Screen
      A) Login -> Upload geoJSON data to begin creating widgets
      B) Creating Widgets - Click NEW button in nav bar
         1) Select dataset to use -> Select Widget Type
             BAR & PIE CHART:
                 1) select X axis attribute from dataset
                     a) if X Attribute contains >25 unique values number of buckets field appears
                 2) Select y axis attribute (defaulted to count of x)
                     a) y attribute options contain count and sum of(X) for numerical attributes X
                 OPTIONAL)
                     1) Add Filter
                         - Select attribute to filter by
                         - Select acceptable value(s) for filter attribute
                     2) Include Null values - check box to include entries where X attribute value = Null/undefined
             Table:
                 1) select attributes from dataset to include in table
             Map:
                 1) Click stack icon in upper right corner of a map widget to toggle map layers and render data

       C) Widget Use:
         1) Drag widgets by top banner 
         2) Resize widgets by edges & corners
         3) BAR, PIE, & TABLE
             a) Burger Menu - Entire datset OR Rendered Data in map
               - to use rendered map data, User must have that data layer turned on in map
       D) Save Dashboard - click SAVE in nav bar to save this dashboard
           - Enter Dashboard Name -> click Submit & Save
           - Saved Dashboards are viewable in homescreen

SETUP GUIDE:

  1) Downloading the Project
     A) Create a GitHub account
     B) Use one of the GitHub links to clone the repo to your account (HTTPS Link:https://github.com/OSpiers7/easydash-GIS.git)

  2) Supabase
     A) Setting up the Database
       1) Create an account with Supabase
       2) Navigate to the buckets and create three buckets with names "dashboards", "datasets", and "screenshots"
       3) Go to policies in the bucket dashboard and add policies to each bucket
          3a) Each bucket can be assigned policies to allow or block access
          3b) Assign a policy (choose "For Full Customization" option) that allows authenticated users to read, write, and delete
          3c) Assign another policy for unauthenticated users to be able to read so they can load data from here
     
     B) Setting up Authentication
       1) Navigate to Authentication on your Supabase dashboard
       2) Create a set called "Users" and enable the ability to login with emails and email password recovery
       3) Customize the login to persist after refresh, which will possibly be the default setting
     
     C) Linking to your Supabase
       1) Go to general setting and find "Data API" or "API Setting"
       2) Copy the url and anon public key
       3) Open the EasyDash directory and create a new file that's just ".env" no name and file extension env
       4) Put the project url and public key in the file with this format:
          VITE_SUPABASE_URL=PROJECT URL
          VITE_SUPABASE_ANON_KEY=PUBLIC ANON API KEY

  3) Setting up Vercel
     A) Create a Vercel account
     B) Link your account to a GitHub that's hosting the files
