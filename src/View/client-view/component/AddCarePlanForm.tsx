import React, { useEffect, useState } from "react";
import {
  Button,
  TextField,
  MenuItem,
  Grid,
  Select,
  InputLabel,
  FormControl,
  FormHelperText,
  Stack,
  IconButton,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Formik, FieldArray, Form, FormikProps } from "formik";
import { CarePlan, CarePlanStatus, GoalOutcome, saveCarePlan, UpdateCarePlan } from "../../../slices/carePlanSlice/carePlan";
import * as Yup from "yup";
import { useAppDispatch, useAppSelector } from "@slices/store";
import { useSearchParams } from "react-router-dom";
import { Client } from "@slices/clientSlice/client";
import { State } from "../../../types/types";

interface AddCarePlanFormProps {
    isEditMode:boolean; 
    setIsEditMode:React.Dispatch<React.SetStateAction<boolean>>;
    activeStepper: number;
}

const AddCarePlanForm = ({activeStepper,isEditMode,setIsEditMode}:AddCarePlanFormProps) => {
    const carePlanSlice = useAppSelector(state=>state.carePlans);
    const clientDetails = useAppSelector(state=>state.clients);
    const [Clients,setClients] = useState<Client[]>([]);
    const [carePlanStatusList, setCarePlanStatusList] = useState<CarePlanStatus[]>([]);
    const [clientList,setSelectedClientList] = useState<{clientID:String,name:String}[]>([]);
    const [goalOutcomeList,setGoalOutcomeList] = useState<GoalOutcome[]>([]);
    const [searchParams] = useSearchParams();
    const [initialValues,setInitialValues]= useState<CarePlan>(
        {
            title: "",
            careplanID: "",
            carePlanStatusID: "",
            startDate: "",
            endDate: "",
            clientID: "",
            carePlanLongTermGoals: [],
            carePlanBillables: [],
        }
    );
    const clientID = searchParams.get('clientID');
    const dispatch = useAppDispatch();

    useEffect(()=>{
        setClients(clientDetails?.clients);
    },[clientDetails?.State])

    useEffect(()=>{
        setCarePlanStatusList(carePlanSlice.carePlanStatusList);
        setGoalOutcomeList(carePlanSlice.goalOutcomeList);
    },[carePlanSlice.state])

    useEffect(()=>{
        if (clientID!==null && clientID!==undefined && clientID!=='') {
            if (clientDetails?.selectedClient){
                let client = clientDetails?.selectedClient;
                setSelectedClientList([...clientList,{clientID:clientID,name:client.firstName+" "+client.lastName}]);
          }
        }else{
          setSelectedClientList([...Clients?.map((client)=>({clientID:client.clientID as string,name:client.firstName+" "+client.lastName}))]);
        }
    },[clientID])

    useEffect(()=>{       
        if(carePlanSlice.selectedCarePlan){
            setInitialValues({
                ...carePlanSlice.selectedCarePlan,
                carePlanStatusID:carePlanStatusList.find((status)=>status.status === carePlanSlice?.selectedCarePlan?.carePlanStatusID)?.careplanStatusID as string,
                
            })
        }else{
            setInitialValues({
                title: "",
                careplanID: "",
                carePlanStatusID: "",
                startDate: "",
                endDate: "",
                clientID: "",
                carePlanLongTermGoals: [],
                carePlanBillables: [],
            })
        }
    },[carePlanSlice.selectedCarePlan])

    const validationSchema = Yup.object({
        title: Yup.string().required("Title is required"),
        carePlanStatusID: Yup.string().required("Care Plan Status is required"),
        startDate: Yup.date().required("Start Date is required"),
        endDate: Yup.date()
          .required("End Date is required")
          .min(Yup.ref("startDate"), "End Date must be after Start Date"),
        clientID: Yup.string().required("Client is required"),
        carePlanLongTermGoals: Yup.array()
          .of(
            Yup.object({
              longTermGoal: Yup.string().required("Long Term Goal is required"),
              achieveWay: Yup.string().required("Achieve Way is required"),
              supportWay: Yup.string().required("Support Way is required"),
            //   notes: Yup.string().required("Notes are required"),
              carePlanShortTermGoals: Yup.array()
                .of(
                  Yup.object({
                    goalTitle: Yup.string().required("Goal Title is required"),
                    goalDescription: Yup.string().required("Goal Description is required"),
                    goalOutcomeTypeID: Yup.string().required("Goal Outcome Type is required"),
                    outcomeDetails: Yup.string().required("Outcome Details are required"),
                    goalStrategy: Yup.string().required("Goal Strategy is required"),
                  })
                )
            })
          ),
        carePlanBillables: Yup.array()
          .of(
            Yup.object({
              name: Yup.string().required("Billable Item Name is required"),
              amount: Yup.number()
                .required("Amount is required")
                .positive("Amount must be positive"),
            })
          )
      });

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize={true}
      onSubmit={(values) => {
        console.log("Form Submitted", values);
        if(carePlanSlice.selectedCarePlan){
            dispatch(UpdateCarePlan(values));
        }else{
            dispatch(saveCarePlan(values));
        }
      }}
    >
      {({
        values,
        handleChange,
        setFieldValue,
        handleBlur,
        resetForm,
        errors,
        touched,
      }: FormikProps<CarePlan>) => {
            useEffect(()=>{
                if (carePlanSlice.submitState === State.success) {
                    resetForm();
                }
            },[carePlanSlice.submitState])

            useEffect(()=>{
                console.log("errors",errors);
                
            },[errors])
            
        return (
        <Form>
          {/* Step 0 */}
          {activeStepper === 0 && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="title"
                  label="Title"
                  InputProps={{ readOnly: !isEditMode }}
                  value={values.title}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.title && Boolean(errors.title)}
                  helperText={touched.title && errors.title}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl
                  fullWidth
                  error={
                    touched.carePlanStatusID && Boolean(errors.carePlanStatusID)
                  }
                >
                  <InputLabel>Care Plan Status</InputLabel>
                  <Select
                    name="carePlanStatusID"
                    value={values.carePlanStatusID}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    readOnly={!isEditMode}
                  >
                    {
                        carePlanStatusList.map((status)=>(
                             <MenuItem value={status.careplanStatusID}>{status.status}</MenuItem>
                        ))
                    }
                  </Select>
                  <FormHelperText>
                    {touched.carePlanStatusID && errors.carePlanStatusID}
                  </FormHelperText>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl
                  fullWidth
                  error={touched.clientID && Boolean(errors.clientID)}
                >
                  <InputLabel>Client</InputLabel>
                  <Select
                    name="clientID"
                    onBlur={handleBlur}
                    readOnly={!isEditMode}
                    value={values.clientID}
                    onChange={handleChange}
                  >
                  {
                      clientList.map((client)=>(
                            <MenuItem value={client.clientID as string}>{client.name as string}</MenuItem>
                      ))}
                  </Select>
                  <FormHelperText>
                    {touched.clientID && errors.clientID}
                  </FormHelperText>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  name="startDate"
                  label="Start Date"
                  InputProps={{ readOnly: !isEditMode }}
                  value={values.startDate}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.startDate && Boolean(errors.startDate)}
                  helperText={touched.startDate && errors.startDate}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  name="endDate"
                  label="End Date"
                  InputProps={{ readOnly: !isEditMode }}
                  value={values.endDate}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.endDate && Boolean(errors.endDate)}
                  helperText={touched.endDate && errors.endDate}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          )}

          {/* Step 1 */}
          {activeStepper === 1 && (
            <FieldArray name="carePlanLongTermGoals">
              {({ push, remove }) => (
                <div>
                  {values.carePlanLongTermGoals.map((_, index) => (
                    <Stack
                      my={1}
                      width="100%"
                      border="2px solid gray"
                      p={2}
                      sx={{ borderRadius: 2, borderStyle: "dashed" }}
                    >
                      <Typography variant="body1" mb={1} fontWeight={600}>
                        Long Term Goal {index + 1}
                      </Typography>
                      <Grid container spacing={2} key={index}>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            onBlur={handleBlur}
                            InputProps={{ readOnly: !isEditMode }}
                            name={`carePlanLongTermGoals[${index}].longTermGoal`}
                            label="Long Term Goal"
                            value={
                              values.carePlanLongTermGoals[index].longTermGoal
                            }
                            onChange={handleChange}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            name={`carePlanLongTermGoals[${index}].achieveWay`}
                            label="Achieve Way"
                            onBlur={handleBlur}
                            InputProps={{ readOnly: !isEditMode }}
                            value={
                              values.carePlanLongTermGoals[index].achieveWay
                            }
                            onChange={handleChange}
                          />
                        </Grid>
                        <Grid
                          item
                          xs={12}
                          sm={4}
                          display="flex"
                          flexDirection="row"
                        >
                          <TextField
                            fullWidth
                            name={`carePlanLongTermGoals[${index}].supportWay`}
                            label="Support Way"
                            InputProps={{ readOnly: !isEditMode }}
                            onBlur={handleBlur}
                            value={
                              values.carePlanLongTermGoals[index].supportWay
                            }
                            onChange={handleChange}
                          />
                          <Stack>
                            <IconButton onClick={() => remove(index)}>
                              <DeleteOutlineIcon />
                            </IconButton>
                          </Stack>
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            InputProps={{ readOnly: !isEditMode }}
                            name={`carePlanLongTermGoals[${index}].notes`}
                            label="Additional notes"
                            onBlur={handleBlur}
                            value={
                              values.carePlanLongTermGoals[index].notes
                            }
                            onChange={handleChange}
                          />
                        </Grid>
                      </Grid>
                      <FieldArray
                        name={`carePlanLongTermGoals[${index}].carePlanShortTermGoals`}
                      >
                        {({
                          push: pushShortTermGoal,
                          remove: removeShortTermGoal,
                        }) => (
                          <div>
                            <Typography variant="h6" mt={2} mb={1}>
                              Short Term Goals
                            </Typography>
                            {values.carePlanLongTermGoals[
                              index
                            ].carePlanShortTermGoals.map(
                              (shortTermGoal, subIndex) => (
                                <Stack
                                  key={subIndex}
                                  mb={2}
                                  p={2}
                                  border="1px solid #ccc"
                                  borderRadius={2}
                                >
                                  <Typography
                                    variant="body2"
                                    mb={1}
                                    fontWeight={600}
                                  >
                                    Short Term Goal {subIndex + 1}
                                  </Typography>
                                  <Grid container spacing={2}>
                                    <Grid item xs={12} sm={4}>
                                      <TextField
                                        fullWidth
                                        name={`carePlanLongTermGoals[${index}].carePlanShortTermGoals[${subIndex}].goalTitle`}
                                        label="Goal Title"
                                        onBlur={handleBlur}
                                        InputProps={{ readOnly: !isEditMode }}
                                        value={shortTermGoal.goalTitle}
                                        onChange={handleChange}
                                      />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                      <TextField
                                        fullWidth
                                        name={`carePlanLongTermGoals[${index}].carePlanShortTermGoals[${subIndex}].goalDescription`}
                                        label="Goal Description"
                                        onBlur={handleBlur}
                                        InputProps={{ readOnly: !isEditMode }}
                                        value={shortTermGoal.goalDescription}
                                        onChange={handleChange}
                                      />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                      <FormControl
                                        fullWidth
                                        error={
                                          touched.carePlanLongTermGoals?.[index]?.carePlanShortTermGoals?.[subIndex]?.goalOutcomeTypeID &&
                                          Boolean((errors.carePlanLongTermGoals?.[index] as any)?.carePlanShortTermGoals?.[subIndex]?.goalOutcomeTypeID)
                                        }
                                      >
                                        <InputLabel>
                                            Goal Outcome Type
                                        </InputLabel>
                                        <Select
                                        readOnly={!isEditMode}
                                          name= {`carePlanLongTermGoals[${index}].carePlanShortTermGoals[${subIndex}].goalOutcomeTypeID`}
                                          value={values.carePlanLongTermGoals?.[index]?.carePlanShortTermGoals?.[subIndex]?.goalOutcomeTypeID}
                                          onChange={handleChange}
                                        >
                                            {
                                                goalOutcomeList.map((outcome)=>(
                                                    <MenuItem value={outcome.goalOutcomeID}>{outcome.status}</MenuItem>
                                                ))
                                            }
                                        </Select>
                                        <FormHelperText>
                                          {touched.carePlanStatusID &&
                                            errors.carePlanStatusID}
                                        </FormHelperText>
                                      </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                      <TextField
                                        fullWidth
                                        name={`carePlanLongTermGoals[${index}].carePlanShortTermGoals[${subIndex}].outcomeDetails`}
                                        label="Outcome Details"
                                        InputProps={{ readOnly: !isEditMode }}
                                        onBlur={handleBlur}
                                        value={shortTermGoal.outcomeDetails}
                                        onChange={handleChange}
                                      />
                                    </Grid>
                                    <Grid
                                      item
                                      xs={12}
                                      sm={6}
                                      display="flex"
                                      flexDirection="row"
                                    >
                                      <TextField
                                        fullWidth
                                        name={`carePlanLongTermGoals[${index}].carePlanShortTermGoals[${subIndex}].goalStrategy`}
                                        label="Goal Strategy"
                                        onBlur={handleBlur}
                                        InputProps={{ readOnly: !isEditMode }}
                                        value={shortTermGoal.goalStrategy}
                                        onChange={handleChange}
                                      />
                                      <IconButton
                                        onClick={() =>
                                          removeShortTermGoal(subIndex)
                                        }
                                      >
                                        <DeleteOutlineIcon />
                                      </IconButton>
                                    </Grid>
                                  </Grid>
                                </Stack>
                              )
                            )}
                            <Button
                              color="primary"
                              variant="outlined"
                                disabled={!isEditMode}
                              onClick={() =>
                                pushShortTermGoal({
                                  shortTermGoalID: "",
                                  goalTitle: "",
                                  goalDescription: "",
                                  goalOutcomeTypeID: "",
                                  outcomeDetails: "",
                                  goalStrategy: "",
                                })
                              }
                            >
                              Add Short Term Goal
                            </Button>
                          </div>
                        )}
                      </FieldArray>
                    </Stack>
                  ))}
                  <Button
                    color="primary"
                    variant="outlined"
                    disabled={!isEditMode}
                    onClick={() =>
                      push({
                        longTermGoal: "",
                        carePlanShortTermGoals: [],
                      })
                    }
                  >
                    Add Long Term Goal
                  </Button>
                </div>
              )}
            </FieldArray>
          )}

          {/* Step 2 */}
          {activeStepper === 2 && (
            <FieldArray name="carePlanBillables">
              {({ push, remove }) => (
                <div>
                  {values.carePlanBillables.map((_, index) => (
                    <Stack
                    key={index}
                    mb={2}
                    // p={2}
                    // border="1px solid #ccc"
                    // borderRadius={2}
                  >
                    <Grid container spacing={2} key={index}>
                      <Grid item xs={12} sm={8}>
                        <TextField
                          fullWidth
                          name={`carePlanBillables[${index}].name`}
                          label="Billable Item Name"
                          InputProps={{ readOnly: !isEditMode }}
                          onBlur={handleBlur}
                          value={values.carePlanBillables[index].name}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4} display="flex" flexDirection="row">
                        <TextField
                          fullWidth
                          name={`carePlanBillables[${index}].amount`}
                          label="Amount"
                          type="number"
                          InputProps={{ readOnly: !isEditMode }}
                          onBlur={handleBlur}
                          value={values.carePlanBillables[index].amount}
                          onChange={handleChange}
                        />
                        <IconButton
                        onClick={() => remove(index)}
                                      >
                                        <DeleteOutlineIcon />
                                      </IconButton>
                      </Grid>
                    </Grid>
                    </Stack>
                  ))}
                  <Button
                    color="primary"
                    disabled={!isEditMode}
                    variant="outlined"
                    onClick={() =>
                      push({
                        name: "",
                        amount: "",
                      })
                    }
                  >
                    Add Billable Item
                  </Button>
                </div>
              )}
            </FieldArray>
          )}

          <Grid container spacing={2} mt={2}>
            <Grid item>
              <button id="carePlan-submit-btn" style={{display:"none"}} type="submit">
                Submit
              </button>
            </Grid>
          </Grid>
        </Form>
        )}}
    </Formik>
  );
};

export default AddCarePlanForm;
