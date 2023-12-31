import React from "react";
import { connect } from "react-redux";
import {
  saveUserDetailsInRedux,
  saveUserFCMInRedux,
  saveLanguageInRedux,
  saveTermsAcceptedStatus,
} from "../redux/actions/User";
import {
  View,
  Text,
  SafeAreaView,
  ImageBackground,
  Animated,
  StyleSheet,
  TouchableHighlight,
  StatusBar,
  Linking,
  Image,
  Platform,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import {
  StackActions,
  NavigationActions,
  NavigationEvents,
} from "react-navigation";
import Assets from "../assets";
import Metrics from "../utils/metrics";
import EDThemeButton from "../components/EDThemeButton";
import { EDColors } from "../utils/EDColors";
import { strings } from "../locales/i18n";
import EDRTLView from "../components/EDRTLView";
import EDUnderlineButton from "../components/EDUnderlineButton";
import { heightPercentageToDP } from "react-native-responsive-screen";
import I18n from "react-native-i18n";
import EDRTLText from "../components/EDRTLText";
import {
  getUserLoginDetails,
  getLanguage,
  getCartList,
  getSelectedStore,
  getIsTermsAndConditionsAccepted,
  setIsTermsAndConditionsAccepted,
  saveUserLoginDetails,
} from "../utils/AsyncStorageHelper";
import {
  debugLog,
  GOOGLE_API_KEY,
  isRTLCheck,
  NOTIFICATION_TYPE,
  ORDER_TYPE,
} from "../utils/EDConstants";
import { saveCartDataInRedux } from "../redux/actions/Checkout";
import { netStatus } from "../utils/NetworkStatusConnection";
import { getCMSPageDetails } from "../utils/ServiceManager";
import { saveCMSPagesData, saveStoreDetails } from "../redux/actions/Content";
import { changeCartButtonVisibility } from "../redux/actions/FloatingButton";
import NavigationService from "../../NavigationService";
import { showDialogue } from "../utils/EDAlert";
import EDPopupView from "../components/EDPopupView";
import EDWebViewComponent from "../components/EDWebViewComponent";
import {
  getAddress,
  getCurrentLocation,
} from "../utils/LocationServiceManager";
import { checkLocationPermission } from "../utils/LocationServices";
import { PERMISSIONS } from "react-native-permissions";
import AsyncStorage from "@react-native-community/async-storage";

var redirectType = "";

class SplashContainer extends React.Component {
  constructor(props) {
    super(props);

    this.isTermsAndConditionsAccepted = false;
    redirectType = this.props.screenProps;

    this.state = {
      bounceValue: new Animated.Value(Metrics.screenHeight),
      isTermsAndConditionsDialogueVisible: false,
      isModalOpen: false,
      is18Up: false,
    };
  }

  getCurrentAddress = (lat, long) => {
    debugLog("LAT LONG ::::", lat, long);
    getAddress(
      lat,
      long,
      (onSuccess) => {
        debugLog("ON SUCCESS GET ADDRESS :::::", onSuccess);
        let addressData = {
          latitude: lat,
          longitude: long,
          areaName: onSuccess.localArea,
          address: onSuccess.strAddress,
        };
        this.props.saveCurrentLocation(addressData);
      },
      this.onFailureGetAddress,
      GOOGLE_API_KEY
    );
  };

  onFailureGetAddress = (onFailure) => {
    debugLog("Address Fail:::::::: ", onFailure);
  };

  Get_User_Current_Location() {
    var paramPermission =
      Platform.OS === "ios"
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        : PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION;
    checkLocationPermission(
      paramPermission,
      () => {
        getCurrentLocation(
          (onSucces) => {
            console.log("LOCATION PERMISSION GRANTED::::::::::", onSucces);
            this.getCurrentAddress(onSucces.latitude, onSucces.longitude);
            3;
          },
          () => {
            debugLog("UNABLE TO FETCH CURRENT LOCATION:::::");
          },
          GOOGLE_API_KEY
        );
      },
      (onFailure) => {
        debugLog("LOCATION PERMISSION NOT GRANTED ::::::", onFailure);
      }
    );
  }

  componentDidMount() {
    this.props.changeCartButtonVisibility({
      shouldShowFloatingButton: false,
      currentScreen: this.props,
    });
    //Get_SUer_Location
    this.Get_User_Current_Location();

    //GET THE PROPS AGE RATING

    this.getAgeState();
  }

  //getAgeState
  getAgeState = async () => {
    const Age = await AsyncStorage.getItem("AgeOfUser");
    this.setState({ is18Up: Age == "true" ? true : false }, () => {
      // CHECK IS TERMS & CONDITIONS ACCEPTED
      getIsTermsAndConditionsAccepted(
        (onSuccess) => {
          debugLog("SUCCESS IN FETCHING T&C ::: " + onSuccess);
          this.isTermsAndConditionsAccepted = onSuccess;
          setIsTermsAndConditionsAccepted(
            false,
            () => {
              debugLog("Saved successfully");
            },
            () => {
              debugLog("failed");
            }
          );
          this.props.saveTermsAndConditionsStatus(false);
        },
        (error) => {
          debugLog("ERROR IN FETCHING T&C ::: " + error);
        }
      );

      // MAINTAIN LANGUAGE SELECTION
      getLanguage(
        (languageSelected) => {
          var languageToSave = languageSelected || "en";
          I18n.locale = languageToSave;
          this.props.saveLanguageRedux(languageToSave);

          // GET CMS PAGES
          this.getCMSDetails(languageToSave);
        },
        (_err) => {
          var languageToSave = "en";
          I18n.locale = languageToSave;
          this.props.saveLanguageRedux(languageToSave);

          // GET CMS PAGES
          this.getCMSDetails(languageToSave);
        }
      );

      console.log("NAVIGATION TO HOME ::::::: ", redirectType);
      // CHECK FOR AUTO LOGIN
      getUserLoginDetails(this.onSuccessHandler, this.onErrorHandler);
      // CHECK FOR PERSISTENT CART
      this.getCartData();
    });
  };

  onWillFocusSplashContainer = () => {
    this.props.changeCartButtonVisibility({
      shouldShowFloatingButton: false,
      currentScreen: this.props,
    });
  };

  onDidFocusSplashContainer = () => {
    this.props.changeCartButtonVisibility({
      shouldShowFloatingButton: false,
      currentScreen: this.props,
    });
  };

  onAcceptPressHandler = () => {
    this.setState({ isTermsAndConditionsDialogueVisible: false });
    this.props.saveTermsAndConditionsStatus(true);
    setIsTermsAndConditionsAccepted(
      true,
      () => {},
      () => {}
    );
    this.props.navigation.navigate("register");
  };

  onDismissTermsAndConditionsDialogue = () => {
    this.setState({ isTermsAndConditionsDialogueVisible: false });
  };

  renderTermsAndConditionsDialogue = () => {
    return (
      <EDPopupView
        isModalVisible={this.state.isTermsAndConditionsDialogueVisible}
      >
        <EDWebViewComponent
          cmsSlug={"terms-and-conditions"}
          lan={this.props.lan}
          onAcceptPressHandler={this.onAcceptPressHandler}
          onDismissHandler={this.onDismissTermsAndConditionsDialogue}
        />
      </EDPopupView>
    );
  };

  render() {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <NavigationEvents
          onWillFocus={this.onWillFocusSplashContainer}
          onDidFocus={this.onDidFocusSplashContainer}
        />

        {this.renderTermsAndConditionsDialogue()}

        <ImageBackground
          resizeMode={"cover"}
          style={{
            height: Metrics.actualScreenheight / 2,
            top: Metrics.actualScreenheight / 10,
          }}
          source={Assets.bgSplash}
        />
        <Animated.View
          style={[
            styles.subView,
            {
              transform: [{ translateY: this.state.bounceValue }],
              useNativeDriver: false,
            },
          ]}
        >
          <View style={{ flex: 1, justifyContent: "center" }}>
            <EDThemeButton
              textStyle={{ color: EDColors.white }}
              style={{ backgroundColor: EDColors.primary }}
              onPress={this._onPressSignIn}
              label={strings("splash.signIn")}
            />

            <EDThemeButton
              onPress={this._onPressSkip}
              isTransparent={true}
              label={strings("splash.skip")}
              style={styles.SkipButton}
              textStyle={{ color: EDColors.black }}
            />

            <EDRTLView
              style={{
                justifyContent: "center",
                marginTop: 25,
                alignItems: "center",
              }}
            >
              <EDRTLText
                title={strings("splash.noAccount")}
                style={styles.TextStyle1}
              />
              <EDUnderlineButton
                onPress={this._onPressSignUp}
                label={strings("splash.signUp")}
                textStyle={styles.TextStyle}
                buttonStyle={{ borderBottomColor: EDColors.black }}
              />
            </EDRTLView>
          </View>
        </Animated.View>
        {this.state.isModalOpen && (
          <View style={styles.ModalOPen}>
            <View style={styles.popUp}>
              <Text style={styles.Text}>are you 18+ or not?</Text>
              <View style={styles.ButtonsView}>
                <TouchableOpacity
                  style={styles.Buttons}
                  onPress={() => {
                    AsyncStorage.setItem("AgeOfUser", "false");
                    this.setState({ isModalOpen: false, is18Up: false });
                  }}
                >
                  <Text>No</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.Buttons,
                    { backgroundColor: EDColors.primary },
                  ]}
                  onPress={() => {
                    AsyncStorage.setItem("AgeOfUser", "true");
                    this.setState({ isModalOpen: false, is18Up: true });
                  }}
                >
                  <Text style={{ color: "white" }}>Yes</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    );
  }

  _toggleSubview() {
    Animated.spring(this.state.bounceValue, {
      toValue: 0,
      velocity: 3,
      tension: 2,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }

  getCartData = () => {
    getCartList(
      (onSuccess) => this.props.saveCartDataInRedux(onSuccess),
      (noCartFound) => this.props.saveCartDataInRedux(noCartFound),
      (onFailure) => debugLog("Cart Data Fail ::::::::: ", onFailure)
    );
  };

  onSuccessHandler = (objLoginDetails) => {
    if (
      objLoginDetails === undefined ||
      objLoginDetails == null ||
      objLoginDetails.UserID === undefined ||
      objLoginDetails.UserID == null
    ) {
      this.onErrorHandler();
      return;
    }

    // SAVE USER DETAILS IN REDUX
    this.props.saveUserDetailsInRedux(objLoginDetails);
    if (redirectType == ORDER_TYPE) {
      redirectType = undefined;
      NavigationService.navigateToOrderPage("myOrders");
    } else if (redirectType == NOTIFICATION_TYPE) {
      redirectType = undefined;
      NavigationService.navigateToOrderPage("notifications");
    } else {
      // NAVIGATE TO HOME SCREEN
      this.props.navigation.dispatch(
        StackActions.reset({
          index: 0,
          actions: [
            // NavigationActions.navigate({routeName: 'storesList'}),
            NavigationActions.navigate({
              routeName: isRTLCheck() ? "mainRTL" : "main",
            }),
          ],
        })
      );
    }
  };

  onErrorHandler = (errorGetUserDetails) => {
    debugLog("AUTO LOGIN FAILURE :: ", errorGetUserDetails);
    setTimeout(() => {
      this._toggleSubview();
    }, 3000);

    !this.state.is18Up && this.setState({ isModalOpen: true });
  };

  getCMSDetails = (selectedLanguage) => {
    netStatus((isConnected) => {
      if (isConnected) {
        let objCMSParams = {
          language_slug: selectedLanguage,
        };
        getCMSPageDetails(
          objCMSParams,
          this.onSucessGetCMSDetails,
          this.onFailureGetCMSDetails
        );
      }
    });
  };

  onSucessGetCMSDetails = (objCMSSuccessResponse) => {
    if (
      objCMSSuccessResponse.data !== undefined &&
      objCMSSuccessResponse.data.cmsData !== undefined
    ) {
      debugLog("SIDE MENU CMS :: ", objCMSSuccessResponse.data.cmsData);
      this.props.saveCMSDetails(objCMSSuccessResponse.data.cmsData);
    }
  };

  onFailureGetCMSDetails = (objCMSFailureResponse) => {};

  buttonTermsOfUsePressed = () => {
    this.openExternalWebPage();
  };

  buttonPrivacyPolicyPressed = () => {
    this.openExternalWebPage();
  };

  openExternalWebPage = () => {
    const strCallURL = "https://eatanceapp.com/privacy-policy/";
    if (Linking.canOpenURL(strCallURL)) {
      Linking.openURL(strCallURL).catch((error) => {
        debugLog("ERROR :: ", error);
        // showDialogue('generalNew.canNotDial')
      });
    } else {
      // showDialogue('generalNew.canNotDial')
    }
  };

  _onPressSignIn = () => {
    if (this.state.is18Up) {
      this.props.navigation.navigate("login", {
        isCheckout: false,
      });
    } else {
      this.setState({ isModalOpen: true });
    }
  };

  // _set_user_dummy_data
  _set_user_dummy_data() {
    let user_dummy = {
      Email: "",
      FirstName: "",
      LastName: "",
      PhoneNumber: "",
      UserID: "0",
      date_of_birth: "",
      image: "",
      isEmailVerified: "1",
      language_slug: "en",
      notification: "0",
      rating: "2",
      status: "1",
      tnc_status: "1",
    };
    this.props.saveUserDetailsInRedux(user_dummy);
    // saveUserLoginDetails(
    //   user_dummy,
    //   (onSuccess) => debugLog('SUCCESS ASYNC STORE :: ', onSuccess),
    //   (onFailure) => debugLog('FAILURE ASYNC STORE :: ', onFailure),
    // );
    global.isSkipUser = true;
    this.props.navigation.dispatch(
      StackActions.reset({
        index: 0,
        actions: [
          NavigationActions.navigate({
            routeName: isRTLCheck() ? "mainRTL" : "main",
          }),
          // NavigationActions.navigate({
          //   routeName: 'storesList',
          // }),
        ],
      })
    );
  }

  _onPressSkip = () => {
    // NAVITGATE USER TO STORES LIST ALWAYS
    //FirstSetDummyLoginDataForSkipOrder

    if (this.state.is18Up) {
      this.props.saveTermsAndConditionsStatus(true);
      this._set_user_dummy_data();
    } else {
      this.setState({ isModalOpen: true });
    }

    // Fetched selected store from async storage
    // getSelectedStore(
    //   onSuccess => {
    //     console.log("On Selected STORE :::", onSuccess)
    //     if (onSuccess !== undefined || onSuccess !== null) {
    //       this.props.saveStoreDetailsInRedux(onSuccess)
    //       this.props.navigation.dispatch(
    //         StackActions.reset({
    //           index: 0,
    //           actions: [NavigationActions.navigate({ routeName: 'main' })],
    //         }),
    //       )
    //     }
    //   },
    //   onFailure => {
    //   debugLog("No saved store found ::::::: ", onFailure),
    //     this.props.navigation.dispatch(
    //       StackActions.reset({
    //         index: 0,
    //         actions: [NavigationActions.navigate({ routeName: 'storesList' })],
    //       }),
    //     )
    //   }
    // )
  };

  _onPressSignUp = () => {
    if (this.state.is18Up) {
      if (this.props.isTermsAndConditionsAccepted) {
        this.props.navigation.navigate("register");
      } else {
        this.setState({ isTermsAndConditionsDialogueVisible: true });
      }
    } else {
      this.setState({ isModalOpen: true });
    }
  };
  //#endregion
}

//#region STYLE SHEET
var styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  subView: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: Metrics.screenHeight * 0.5,
  },
  TextStyle: {
    color: "blue",
    fontWeight: "600",
  },
  TextStyle1: {
    color: EDColors.black,
  },
  SkipButton: {
    borderColor: EDColors.black,
  },
  ModalOPen: {
    height: Dimensions.get("window").height,
    width: Dimensions.get("window").width,
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, .4)",
    alignItems: "center",
    justifyContent: "center",
  },
  popUp: {
    width: 250,
    backgroundColor: "white",
    borderColor: "gray",
    borderWidth: 0.5,
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 5,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  Buttons: {
    height: 30,
    width: 60,
    backgroundColor: EDColors.offWhite,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
  },
  ButtonsView: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-around",
    marginTop: 20,
  },
  Text: {
    fontSize: 18,
    color: EDColors.primary,
  },
});
//#endregion

//#region REDUX
export default connect(
  (state) => {
    return {
      lan: state.userOperations.lan,
      isTermsAndConditionsAccepted:
        state.userOperations.isTermsAndConditionsAccepted,
      objStoreDetails: state.contentOperations.objStoreDetails,
    };
  },
  (dispatch) => {
    return {
      saveUserDetailsInRedux: (detailsToSave) => {
        dispatch(saveUserDetailsInRedux(detailsToSave));
      },
      saveLanguageRedux: (language) => {
        dispatch(saveLanguageInRedux(language));
      },
      saveCartDataInRedux: (data) => {
        dispatch(saveCartDataInRedux(data));
      },
      saveCMSDetails: (cmsDetails) => {
        dispatch(saveCMSPagesData(cmsDetails));
      },
      changeCartButtonVisibility: (data) => {
        dispatch(changeCartButtonVisibility(data));
      },
      saveStoreDetailsInRedux: (dataToSave) => {
        dispatch(saveStoreDetails(dataToSave));
      },
      saveTermsAndConditionsStatus: (dataToSave) => {
        dispatch(saveTermsAcceptedStatus(dataToSave));
      },
    };
  }
)(SplashContainer);
