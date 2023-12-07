/* eslint-disable prettier/prettier */
import React from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  Pressable,
  Text,
  TextInput,
} from "react-native";
import Validations from "../utils/Validations";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { EDColors } from "../utils/EDColors";
import EDRTLTextInput from "../components/EDRTLTextInput";
import {
  TextFieldTypes,
  debugLog,
  getProportionalFontSize,
  funGetDate,
} from "../utils/EDConstants";
import Metrics from "../utils/metrics";
import EDRTLText from "../components/EDRTLText";
import { strings } from "../locales/i18n";
import EDThemeButton from "../components/EDThemeButton";
import EDUnderlineButton from "../components/EDUnderlineButton";
import EDRTLView from "../components/EDRTLView";
import { netStatus } from "../utils/NetworkStatusConnection";
import { connect } from "react-redux";
import { signUpUser } from "../utils/ServiceManager";
import { showDialogue, showNoInternetAlert } from "../utils/EDAlert";
import EDThemeHeader from "../components/EDThemeHeader";
import EDProfilePicture from "../components/EDProfilePicture";
import { Icon } from "react-native-elements";
import { EDFonts } from "../utils/EDFontConstants";
import DateTimePicker from "react-native-modal-datetime-picker";
import moment from "moment";
import deviceInfoModule from "react-native-device-info";
import { saveUserFCMInRedux } from "../redux/actions/User";
import { checkFirebasePermission } from "../utils/FirebaseServices";

class SignUpContainer extends React.PureComponent {
  //#region LIFE CYCLE METHODS
  constructor(props) {
    super(props);
    this.validationsHelper = new Validations();
    this.avatarSource = undefined;
  }

  /** DID MOUNT */
  componentDidMount() {
    if (
      this.props.token === undefined ||
      this.props.token === null ||
      this.props.token === ""
    ) {
      checkFirebasePermission(
        (onSuccess) => {
          console.log("onSuccess ::: ", onSuccess);
          this.props.saveToken(onSuccess);
        },
        () => {}
      );
    } else {
      // this.props.saveToken(this.props.token);
    }
  }
  render() {
    return (
      <KeyboardAwareScrollView
        enableResetScrollToCoords={true}
        resetScrollToCoords={{ x: 0, y: 0 }}
        style={styles.scrollContainer}
        bounces={false}
        behavior="padding"
        enabled
      >
        {/* MAIN CONTAINER */}
        <View
          pointerEvents={this.state.isLoading ? "none" : "auto"}
          style={styles.mainViewStyle}
        >
          {/* CUSTOM HEADER */}
          <EDThemeHeader
            onLeftButtonPress={this.buttonBackPressed}
            title={strings("signUpNew.title")}
          />

          {/* SAFE AREA */}
          {/* <SafeAreaView> */}

          {/* TEXT INPUTS CONTAINER */}
          <View style={styles.textFieldStyle}>
            {/* PROFILE IMAGE COMPONENT */}
            <EDProfilePicture
              onImageSelectionHandler={this.onImageSelectionHandler}
            />

            {/* FIRST NAME INPUT */}
            <EDRTLTextInput
              type={TextFieldTypes.default}
              identifier={"firstName"}
              placeholder={strings("signUpNew.firstName")}
              onChangeText={this.textFieldTextDidChangeHandler}
              errorFromScreen={
                this.state.shouldPerformValidation
                  ? this.validationsHelper.checkForEmpty(
                      this.state.objRegistrationDetails.firstName,
                      strings("validationsNew.emptyFirstName")
                    )
                  : ""
              }
            />

            {/* LAST NAME INPUT */}
            <EDRTLTextInput
              type={TextFieldTypes.default}
              identifier={"lastName"}
              placeholder={strings("signUpNew.lastName")}
              onChangeText={this.textFieldTextDidChangeHandler}
              errorFromScreen={
                this.state.shouldPerformValidation
                  ? this.validationsHelper.checkForEmpty(
                      this.state.objRegistrationDetails.lastName,
                      strings("validationsNew.emptyLastName")
                    )
                  : ""
              }
            />

            {/* //SET THE RADIO BUTTON OF EMAIl AND PASSWORD */}

            <View style={{ flexDirection: "row", marginTop: 20 }}>
              <View style={{ flexDirection: "row" }}>
                <TouchableOpacity
                  style={{
                    height: 26,
                    width: 26,
                    borderRadius: 15,
                    borderColor: EDColors.grey,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 1,
                    marginLeft: 20,
                  }}
                  onPress={() => {
                    this.setState({
                      ObjEmailOrPassword: {
                        isEmail: true,
                        isPhone: false,
                      },
                    });
                  }}
                >
                  {this.state.ObjEmailOrPassword.isEmail && (
                    <View
                      style={{
                        height: 20,
                        width: 20,
                        backgroundColor: EDColors.homeButtonColor,
                        borderRadius: 15,
                      }}
                    />
                  )}
                </TouchableOpacity>
                <View>
                  <Text
                    style={{
                      color: "black",
                      fontSize: 20,
                      marginHorizontal: 6,
                      fontWeight: "bold",
                    }}
                  >
                    Email
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: "row" }}>
                <TouchableOpacity
                  style={{
                    height: 26,
                    width: 26,
                    borderRadius: 15,
                    borderColor: EDColors.grey,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 1,
                    marginLeft: 20,
                  }}
                  onPress={() => {
                    this.setState({
                      ObjEmailOrPassword: {
                        isPhone: true,
                        isEmail: false,
                      },
                    });
                  }}
                >
                  {this.state.ObjEmailOrPassword.isPhone && (
                    <View
                      style={{
                        height: 20,
                        width: 20,
                        backgroundColor: EDColors.homeButtonColor,
                        borderRadius: 15,
                      }}
                    />
                  )}
                </TouchableOpacity>
                <View>
                  <Text
                    style={{
                      color: "black",
                      fontSize: 20,
                      marginHorizontal: 6,
                      fontWeight: "bold",
                    }}
                  >
                    Phone
                  </Text>
                </View>
              </View>
            </View>

            {/* E-MAIL INPUT */}
            {this.state.ObjEmailOrPassword.isPhone && (
              <EDRTLTextInput
                type={TextFieldTypes.phone}
                identifier={"mobile"}
                placeholder={strings("signUpNew.phone")}
                onChangeText={this.textFieldTextDidChangeHandler}
                errorFromScreen={
                  this.state.shouldPerformValidation
                    ? this.validationsHelper.checkForMobileNumber(
                        this.state.objRegistrationDetails.mobile,
                        strings("validationsNew.emptyPhone")
                      )
                    : ""
                }
              />
            )}
            {this.state.ObjEmailOrPassword.isEmail && (
              <EDRTLTextInput
                type={TextFieldTypes.email}
                identifier={"email"}
                placeholder={strings("signUpNew.email")}
                onChangeText={this.textFieldTextDidChangeHandler}
                errorFromScreen={
                  this.state.shouldPerformValidation
                    ? this.validationsHelper.validateEmail(
                        this.state.objRegistrationDetails.email,
                        strings("validationsNew.emptyEmail")
                      )
                    : ""
                }
              />
            )}

            {/* Date Of Birth */}
            <EDRTLTextInput
              type={TextFieldTypes.datePicker}
              identifier={"date_of_birth"}
              placeholder={strings("signUpNew.dob")}
              initialValue={this.state.objRegistrationDetails.date_of_birth}
              showDatePicker={this.showDatePicker}
              // onChangeText={this.textFieldTextDidChangeHandler}
              errorFromScreen={
                this.state.shouldPerformValidation
                  ? this.validationsHelper.checkForEmpty(
                      this.state.objRegistrationDetails.date_of_birth,
                      strings("validationsNew.emptyDateOfBirth")
                    )
                  : ""
              }
            />

            {this.state.isDatePickerVisible == true ? (
              <DateTimePicker
                isVisible={this.state.isDatePickerVisible}
                mode={"date"}
                date={new Date(moment().subtract(18, "years"))}
                maximumDate={new Date(moment().subtract(18, "years"))}
                onConfirm={this._handleDatePicked}
                onCancel={this.onCancel}
              />
            ) : null}

            {/* PASSWORD INPUT */}
            <EDRTLTextInput
              type={TextFieldTypes.password}
              identifier={"password"}
              placeholder={strings("signUpNew.password")}
              onChangeText={this.textFieldTextDidChangeHandler}
              errorFromScreen={
                this.state.shouldPerformValidation
                  ? this.validationsHelper.validatePassword(
                      this.state.objRegistrationDetails.password,
                      strings("validationsNew.emptyPassword")
                    )
                  : ""
              }
            />
            <EDRTLView
              style={{
                marginTop: 20,
                alignItems: "flex-start",
                marginHorizontal: 20,
              }}
            >
              <Icon
                name={
                  this.state.tncAccepted
                    ? "check-box"
                    : "check-box-outline-blank"
                }
                color={EDColors.primary}
                size={22}
                onPress={this.toggleTnc}
              />
              <EDRTLView style={{ flexWrap: "wrap", marginHorizontal: 5 }}>
                <EDRTLText
                  title={strings("signUpNew.agree")}
                  style={[styles.tncText]}
                />
                <TouchableOpacity onPress={this.navigateToTnc}>
                  <EDRTLText
                    title={strings("signUpNew.tnc")}
                    style={[styles.tncText, { borderBottomWidth: 1 }]}
                  />
                </TouchableOpacity>
                <EDRTLText
                  title={strings("signUpNew.and")}
                  style={[styles.tncText]}
                />
                <TouchableOpacity onPress={() => this.navigateToTnc(true)}>
                  <EDRTLText
                    title={strings("signUpNew.privacy")}
                    style={[styles.tncText, { borderBottomWidth: 1 }]}
                  />
                </TouchableOpacity>
              </EDRTLView>
            </EDRTLView>
            {/* SIGNUP BUTTON */}
            <EDThemeButton
              style={styles.signUpButton}
              label={strings("signUpNew.signUp")}
              isLoading={this.state.isLoading}
              onPress={this.buttonSignUpPressed}
              isRadius={true}
            />

            {/* BOTTOM CONTAINER */}
            <EDRTLView style={styles.bottomContainer}>
              {/* ALREADY HAVE ACCOUNT */}
              <EDRTLText
                style={styles.alreadyHaveText}
                title={strings("signUpNew.alreadyHave") + "? "}
              />
              <EDUnderlineButton
                buttonStyle={styles.alreadyHaveButton}
                textStyle={styles.signInText}
                onPress={this.buttonSignInPressed}
                label={strings("signUpNew.signIn")}
              />
            </EDRTLView>
          </View>
          <Modal
            animationType="slide"
            transparent={true}
            visible={this.state.isOtpBoxVisible}
            onRequestClose={() => {
              this.setState({
                isOtpBoxVisible: false,
              });
            }}
          >
            <View
              style={[
                styles.centeredView,
                { backgroundColor: "rgba(52, 52, 52, 0.8)" },
              ]}
            >
              <View
                style={[styles.modalView, { justifyContent: "space-evenly" }]}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: "black",
                  }}
                >
                  ENTER YOUR OTP
                </Text>
                <Text>
                  {this.state.isSignUpObjectDoneMessage
                    ? this.state.isSignUpObjectDoneMessage
                    : ""}
                </Text>
                <TextInput
                  style={{
                    height: 40,
                    borderColor: EDColors.homeButtonColor,
                    borderWidth: 1.5,
                    width: 300,
                    borderRadius: 4,
                    paddingHorizontal: 10,
                    letterSpacing: 0.5,
                    textAlign: "center",
                    fontWeight: "500",
                    color: "black",
                  }}
                  keyboardType="number-pad"
                  placeholder="Enter Your Otp."
                  placeholderTextColor={"grey"}
                  onChange={(e) => {
                    console.log(e?.nativeEvent?.text),
                      this.setState({
                        enterOtp: e?.nativeEvent?.text,
                      });
                  }}
                  maxLength={6}
                />
                <EDThemeButton
                  style={[
                    styles.signUpButton,
                    { width: 150, height: 46, marginTop: 0 },
                  ]}
                  label={"Verify"}
                  isLoading={this.state.isOtpLoader}
                  onPress={() => this.verifyTheOtp()}
                  isRadius={true}
                  textStyle={{ fontSize: 16 }}
                />
              </View>
            </View>
          </Modal>
          {/* </SafeAreaView> */}
        </View>
      </KeyboardAwareScrollView>
    );
  }
  //#endregion

  async verifyTheOtp() {
    try {
      this.setState({
        isOtpLoader: true,
      });
      const formdata = new FormData();
      formdata.append("otp", this.state.enterOtp);
      formdata.append("user_id", this.state.getEntry_userID);
      console.log("abdjkabsdjkasb : ", formdata);
      fetch("https://epicwinesandspirits.africa/v2/Api/verify_user", {
        method: "POST",
        body: formdata,
      })
        .then((response) => response.json())
        .then((json) => {
          this.setState({
            isOtpLoader: false,
          });
          console.log("Json : ", json);
          if (json?.status == 1) {
            this.setState({ isOtpBoxVisible: false });
            showDialogue(json?.message, "", [], this.buttonBackPressed);
          } else {
            showDialogue(json?.message, "Alert");
          }
        });
    } catch (error) {
      console.log("error : ", error);
      this.setState({
        isOtpLoader: false,
      });
    }
  }

  navigateToTnc = (forPrivacy) => {
    console.log("TandC & PrivacyPolicy open::::::", forPrivacy);
    this.props.navigation.navigate("cmsFromSignUp", {
      routeParams: {
        screenName:
          forPrivacy == true
            ? strings("signUpNew.privacy")
            : strings("signUpNew.tnc"),
        cmsSlug: forPrivacy == true ? "privacy-policy" : "terms-and-conditions",
        forSignUp: true,
      },
    });
  };

  toggleTnc = () => {
    this.setState({ tncAccepted: !this.state.tncAccepted });
  };
  //#region STATE
  state = {
    isLoading: false,
    shouldPerformValidation: false,
    objRegistrationDetails: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      mobile: "",
      date_of_birth: "",
    },
    tncAccepted: true,
    isDatePickerVisible: false,
    isOtpBoxVisible: false,
    isSignUpObjectDoneMessage: undefined,
    enterOtp: undefined,
    getEntry_userID: undefined,
    isOtpLoader: false,
    ObjEmailOrPassword: {
      isPhone: true,
      isEmail: false,
    },
  };
  //#endregion

  showDatePicker = () => {
    this.setState({ isDatePickerVisible: true });
  };

  //#region HELPER METHODS
  /**
   *
   * @param {The image response received from image picker} imageSource
   */
  onImageSelectionHandler = (imageSource) => {
    this.avatarSource = imageSource;
  };
  //#endregion

  //#region TEXT CHANGE EVENTS
  /**
   *
   * @param {Value of textfield whatever user type} value
   * @param {Unique identifier for every text field} identifier
   */

  textFieldTextDidChangeHandler = (value, identifier) => {
    this.state.objRegistrationDetails[identifier] = value;
    this.setState({ shouldPerformValidation: false });
  };

  _handleDatePicked = (date, identifier) => {
    var datePicked = funGetDate(date);
    this.state.objRegistrationDetails.date_of_birth = moment(
      datePicked,
      "DD-MM-YYYY"
    ).format("YYYY-MM-DD");
    console.log(
      "STORED DATE::::::::",
      moment(datePicked, "DD-MM-YYYY").format("YYYY-MM-DD")
    );
    console.log(
      "New DATE::::::::",
      this.state.objRegistrationDetails.date_of_birth
    );
    this.setState({ isDatePickerVisible: false });
  };

  onCancel = () => {
    this.setState({ isDatePickerVisible: false });
  };

  //#endregion

  //#region BUTTON EVENTS
  /** SIGN UP BUTTON EVENT */
  buttonSignUpPressed = () => {
    if (this.avatarSource === undefined) {
      showDialogue(strings("validationsNew.emptyProfilePicture"));
      return;
    }
    this.setState({ shouldPerformValidation: true });
    if (
      this.validationsHelper.checkForEmpty(
        this.state.objRegistrationDetails.firstName.trim(),
        strings("validationsNew.emptyFirstName")
      ).length > 0 ||
      this.validationsHelper.checkForEmpty(
        this.state.objRegistrationDetails.lastName.trim(),
        strings("validationsNew.emptyLastName")
      ).length > 0 ||
      this.validationsHelper.validatePassword(
        this.state.objRegistrationDetails.password.trim(),
        strings("validationsNew.emptyPassword")
      ).length > 0 ||
      this.validationsHelper.checkForEmpty(
        this.state.objRegistrationDetails.date_of_birth.trim(),
        strings("validationsNew.emptyDateOfBirth")
      ).length > 0
    ) {
      return;
    } else if (
      this.state.ObjEmailOrPassword.isEmail &&
      this.validationsHelper.validateEmail(
        this.state.objRegistrationDetails.email.trim(),
        strings("validationsNew.emptyEmail")
      ).length > 0
    ) {
      return;
    } else if (
      this.state.ObjEmailOrPassword.isPhone &&
      this.validationsHelper.checkForMobileNumber(
        this.state.objRegistrationDetails.mobile.trim(),
        strings("validationsNew.emptyPhone")
      ).length > 0
    ) {
      return;
    } else {
      if (this.state.tncAccepted)
        // CALLING API FOR SIGN UP
        this.callSignUpAPI();
      else showDialogue(strings("signUpNew.tncError"));
    }
  };

  /** BACK BUTTON EVENTS */
  buttonBackPressed = () => {
    this.props.navigation.goBack();
  };
  //#region NETWORK METHODS

  /**
   *
   * @param {The success response object} objSuccess
   */
  onSignUpSuccess = (objSuccess) => {
    this.setState({ isLoading: false });
    console.log("ObjeSignUp :: ", objSuccess);
    if (this.state.ObjEmailOrPassword.isEmail) {
      showDialogue(objSuccess.message, "", [], this.buttonBackPressed);
    } else {
      this.setState({
        isOtpBoxVisible: true,
        isSignUpObjectDoneMessage:
          "Registration has been done successfully.Please enter your otp to activate your account.",
        getEntry_userID: objSuccess?.data?.User?.entity_id,
      });
    }
  };

  /**
   *
   * @param {The failure response object} objFailure
   */
  onSignUpFailure = (objFailure) => {
    this.setState({ isLoading: false });
    debugLog("OBJ FAILURE SIGN UP :: " + JSON.stringify(objFailure));
    showDialogue(objFailure.message);
  };

  callSignUpAPI = () => {
    netStatus((isConnected) => {
      if (isConnected) {
        let objSignUpParams = {
          FirstName: this.state.objRegistrationDetails.firstName,
          Email: this.state.objRegistrationDetails.email,
          Password: this.state.objRegistrationDetails.password,
          image: this.avatarSource,
          PhoneNumber: this.state.objRegistrationDetails.mobile,
          LastName: this.state.objRegistrationDetails.lastName,
          firebase_token: this.props.token,
          device_id: deviceInfoModule.getDeviceId(),
          language_slug: this.props.lan,
          date_of_birth: this.state.objRegistrationDetails.date_of_birth,
          registration_using: this.state.ObjEmailOrPassword.isEmail
            ? "email"
            : "phone",
        };
        this.setState({ isLoading: true });
        signUpUser(
          objSignUpParams,
          this.onSignUpSuccess,
          this.onSignUpFailure,
          this.props
        );
      } else {
        showNoInternetAlert();
      }
    });
  };

  buttonSignInPressed = () => {
    this.props.navigation.navigate("login");
  };
}

//#region STYLES
const styles = StyleSheet.create({
  scrollContainer: { flex: 1, backgroundColor: EDColors.white },
  mainViewStyle: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: EDColors.white,
    paddingBottom: 20,
  },
  textFieldStyle: { justifyContent: "center", paddingBottom: 20 },
  signUpButton: { width: Metrics.screenWidth - 40, marginTop: 40 },
  bottomContainer: {
    justifyContent: "center",
    marginTop: 15,
    alignItems: "center",
  },
  alreadyHaveText: { color: EDColors.noAccount },
  alreadyHaveButton: { borderBottomColor: EDColors.primary },
  signInText: { color: EDColors.primary },
  tncText: {
    fontFamily: EDFonts.regular,
    fontSize: getProportionalFontSize(16),
    color: EDColors.black,
  },
  modalView: {
    backgroundColor: "white",
    borderColor: EDColors.homeButtonColor,
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    height: 240,
    width: 340,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default connect(
  (state) => {
    return {
      lan: state.userOperations.lan,
      token: state.userOperations.token,
    };
  },
  (dispatch) => {
    return {
      saveToken: (token) => {
        dispatch(saveUserFCMInRedux(token));
      },
    };
  }
)(SignUpContainer);
