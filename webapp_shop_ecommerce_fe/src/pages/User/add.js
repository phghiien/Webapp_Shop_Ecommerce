import { DatePicker, InputNumber, Button, Upload, Select, Modal } from 'antd/lib';
import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea"
import { useEffect, useState, useRef, useCallback } from 'react';
import dayjs from 'dayjs';
import axios from 'axios';
import { baseUrl } from '~/lib/functional';
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group"
import { useNavigate } from 'react-router-dom';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "~/components/ui/form"
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "~/components/ui/dialog"
import { IoArrowBackSharp } from "react-icons/io5";
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { ToastContainer, toast } from 'react-toastify';
import { useDropzone } from 'react-dropzone'
import QRScanner from 'qr-scanner'
import { QrReader } from "react-qr-reader";

const formSchema = z.object({
    fullName: z.string().min(2, {
        message: "tên tối thiểu phải có 2 ký tự",
    }),
    gender: z.enum('0', '1'),
    commune: z.string(),
    district: z.string(),
    province: z.string(),
    phone: z.string(),
    detail: z.string(),
    birthday: z.any(),
    email: z.string({ required_error: 'email là bắt buộc' }).email({ message: 'phải là định dạng email' }),

})
const token = 'a98f6e38-f90a-11ee-8529-6a2e06bbae55'
export default function Add() {

    const navigate = useNavigate();

    const [addProvince, setAddProvince] = useState();
    const [addDistrict, setAddDistrict] = useState();
    const [addWard, setAddWard] = useState();

    const [listProvince, setListProvince] = useState([]);
    const [listDistricts, setListDistricts] = useState([]);
    const [listWards, setListWards] = useState([]);

    const [gender, setGender] = useState('0');

    const [originalThumbnail, setOriginalThumbnail] = useState(null);

    useEffect(() => {
        axios.get(`https://online-gateway.ghn.vn/shiip/public-api/master-data/province`, {
            headers: {
                token: token
            }
        }).then(res => {
            setListProvince(res.data.data);
        })
    }, [])

    useEffect(() => {
        if (addProvince) {
            axios.get(`https://online-gateway.ghn.vn/shiip/public-api/master-data/district?province_id=${addProvince.ProvinceID}`, {
                headers: {
                    token: token
                }
            }).then(res => {
                let listFilteredDistrict = res.data.data.filter(dis => dis.DistrictID != 3451)
                setListDistricts(listFilteredDistrict);
                axios.get(`https://online-gateway.ghn.vn/shiip/public-api/master-data/ward?district_id=${listFilteredDistrict[0].DistrictID}`, {
                    headers: {
                        token: token
                    }
                }).then(resp => {
                    setListWards(resp.data.data);
                    setAddWard(resp.data.data[0]);
                })
            })
        }
    }, [addProvince])

    useEffect(() => {
        if (addDistrict) {
            axios.get(`https://online-gateway.ghn.vn/shiip/public-api/master-data/ward?district_id=${addDistrict.DistrictID}`, {
                headers: {
                    token: token
                }
            }).then(res => {
                setListWards(res.data.data);
                setAddWard(res.data.data[0].name)
            })
        }
    }, [addDistrict])

    const form = useForm(
        {
            resolver: zodResolver(formSchema),
            defaultValues: {
                fullName: "",
                gender: "0",
                detail: "",
                phone: "",
                birthday: dayjs(new Date()),
                email: "",
            },
            mode: 'all'
        }
    )

    useEffect(() => {
        console.log(gender)
    }, [gender])

    const onThumbnailDrop = useCallback((acceptedFiles) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const image = new Image();
            image.src = event.target.result;
            image.onload = () => {
                setOriginalThumbnail({
                    file: acceptedFiles[0],
                    width: image.width,
                    height: image.height,
                });
            };
        };
        reader.readAsDataURL(acceptedFiles[0]);
    }, []);

    const {
        getRootProps: getThumbnailRootProps,
        getInputProps: getThumbnailInputProps,
        isDragActive: isThumbnailDragActive,
    } = useDropzone({
        onDrop: onThumbnailDrop,
        accept: {
            "image/*": [],
        },
        maxFiles: 1,
        multiple: false,
    });

    const [result, setResult] = useState()

    const scanImage = (e) => {
        const file = e.target.file;
        if (!file) return;
        QRScanner.scanImage(file, { returnDetailedScanResult: true }).then(QRResult => {
            console.log(QRResult);
            setResult(QRResult);
        })
    }


    const handleSubmitForm = (values) => {
        if (originalThumbnail) {
            const formData = new FormData();
            formData.append("file", originalThumbnail.file);
            formData.append("cloud_name", "db9i1b2yf")
            formData.append("upload_preset", "product")
            axios.post(`https://api.cloudinary.com/v1_1/db9i1b2yf/image/upload`, formData).then(res => {
                const body = {
                    birthday: new Date(dayjs(values.birthday).toDate()).toISOString(),
                    commune: addWard,
                    detail: values.detail,
                    district: addDistrict.DistrictName,
                    province: addProvince.ProvinceName,
                    email: values.email,
                    fullName: values.fullName,
                    gender: gender == '0',
                    phone: values.phone,
                    imageUrl: res.data.url
                }

                axios.post(`${baseUrl}/user`, body).then(() => {
                    toast.success("Thêm mới thành công")
                    form.reset();
                    setOriginalThumbnail(null);
                }).catch(error => {
                    toast.error(error)
                })
            })
        } else {
            const body = {
                birthday: new Date(dayjs(values.birthday).toDate()).toISOString(),
                commune: addWard,
                detail: values.detail,
                district: addDistrict,
                province: addProvince,
                email: values.email,
                fullName: values.fullName,
                gender: gender == '0',
                phone: values.phone,
            }

            axios.post(`${baseUrl}/user/create`, body).then(() => {
                toast.success("Thêm mới thành công")
                form.reset();
                form.setValue("")
                setAddDistrict(null);
                setAddWard(null);
                setOriginalThumbnail(null);
            }).catch(error => {
                toast.error(error)
            })
        }
    }

    const [webScan, setWebScan] = useState();


    const camError = (error) => {
        if (error) {
            console.info(error);
        }
    };

    function ScanResult(result) {
        if (result) {
            if (result.text) {
                setWebScan(result);
                const resultText = result.text;
                const id = resultText.split("||")[0]
                const name = resultText.split("||")[1].split("|")[0]
                const birthday = dayjs(resultText.split("||")[1].split("|")[1], 'DDMMYYYY')
                const gender = resultText.split("||")[1].split("|")[2] == "Nam" ? "0" : "1"
                const province = resultText.split("||")[1].split("|")[3].split(", ")[3]
                const district = resultText.split("||")[1].split("|")[3].split(", ")[2]
                const commune = resultText.split("||")[1].split("|")[3].split(", ")[1]
                const detail = resultText.split("||")[1].split("|")[3].split(", ")[0]
                form.setValue("birthday", birthday)
                form.setValue("detail", detail)
                form.setValue("fullName", name)
                form.setValue("gender", gender)
                setAddDistrict(district);
                setAddProvince(province);
                setAddWard(commune);
            }
        }
    }

    useEffect(() => {
        console.log(webScan);
    }, [webScan])


    return (
        <div className="mb-9">
            <ToastContainer />
            <div className="">
                <Form {...form}>
                    <form onSubmit={e => { e.preventDefault() }} className="w-full flex gap-5 max-lg:flex-col">
                        <div className="w-1/3 max-lg:w-full flex flex-col gap-3 bg-white shadow-lg rounded-md p-5">
                            <div className='flex gap-2 items-center'>
                                <div className='text-lg cursor-pointer' onClick={() => { navigate('/user/staff') }}><IoArrowBackSharp /></div>
                                <p className='text-lg font-bold'>Thông tin nhân viên</p>
                            </div>
                            <div className='relative after:w-full after:h-[2px] after:absolute after:bg-slate-500 after:bottom-0 after:left-0'></div>
                            <div className='w-full flex flex-col'>
                                <div
                                    {...getThumbnailRootProps()}
                                    className="w-1/2 aspect-square self-center rounded-full border border-dashed border-slate-600 mx-5 flex items-center text-center justify-center"
                                >
                                    <input
                                        {...getThumbnailInputProps()}
                                        className="w-full h-full"
                                    />
                                    {isThumbnailDragActive ? (
                                        <p className="text-red-500">Thả ảnh tại đây.</p>
                                    ) : (
                                        <div className="flex gap-1">
                                            {originalThumbnail ? (
                                                <img src={URL.createObjectURL(originalThumbnail.file)} alt='' className='w-full aspect-square rounded-full'></img>
                                            ) : (
                                                <>
                                                    <p>chọn ảnh</p>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <FormField
                                    control={form.control}
                                    name="fullName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Họ và tên</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Họ và tên" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                        <div className="flex-grow flex flex-col gap-3 bg-white shadow-lg rounded-md p-5">
                            <div className='flex justify-between items-center'>
                                <p className='text-lg font-bold'>Thông tin chi tiết</p>
                                <Dialog>
                                    <DialogTrigger>
                                        <Button type='primary'>Quét mã</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        {/* <Select onChange={val => setSelectedCamera(val)} options={devices.map(t => { return { label: t.label, value: t.deviceId } })}></Select> */}
                                        <QrReader
                                            delay={600}
                                            facingMode="user"
                                            onError={camError}
                                            chooseDeviceId={"2"}
                                            onResult={ScanResult}
                                            style={{ width: "100%" }}
                                            legacyMode={false}
                                        />
                                        <p>{webScan && webScan.text}</p>
                                    </DialogContent>
                                </Dialog>
                            </div>
                            <div className='relative after:w-full after:h-[2px] after:absolute after:bg-slate-500 after:bottom-0 after:left-0'></div>
                            <div className='flex flex-col gap-3'>
                                <div className='grid grid-cols-2 gap-3 items-center'>
                                    <FormField
                                        control={form.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Số điện thoại</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="số điện thoại" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="gender"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Giới tính</FormLabel>
                                                <FormControl>
                                                    <RadioGroup className="flex gap-3 items-center" onValueChange={(value) => { setGender(value) }} defaultValue="0">
                                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                                            <FormControl>
                                                                <RadioGroupItem value="0" defaultSelected />
                                                            </FormControl>
                                                            <FormLabel className="font-normal">
                                                                Nam
                                                            </FormLabel>
                                                        </FormItem>
                                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                                            <FormControl>
                                                                <RadioGroupItem value="1" />
                                                            </FormControl>
                                                            <FormLabel className="font-normal">
                                                                Nữ
                                                            </FormLabel>
                                                        </FormItem>
                                                    </RadioGroup>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className='grid grid-cols-2 gap-3 items-center'>
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="email" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="birthday"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Ngày sinh</FormLabel>
                                                <FormControl>
                                                    <div>
                                                        <DatePicker {...field} placeholder='ngày sinh' needConfirm />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                </div>
                                <div className='grid grid-cols-3'>
                                    <FormField
                                        control={form.control}
                                        name="province"
                                        render={({ field }) =>
                                        (
                                            <FormItem>
                                                <FormLabel>Tỉnh/thành phố</FormLabel>
                                                <FormControl>
                                                    <div>
                                                        <Select className='min-w-[120px]' placeholder='Tỉnh/Thành phố' value={addProvince?.ProvinceID} onChange={value => { setAddProvince(listProvince.find(target => target.ProvinceID == value)) }}>
                                                            {
                                                                listProvince.map((province, key) => {
                                                                    return <option key={key} value={province.ProvinceID}>
                                                                        {province.ProvinceName}
                                                                    </option>
                                                                })
                                                            }
                                                        </Select>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="district"
                                        render={({ field }) =>
                                        (
                                            <FormItem>
                                                <FormLabel>Quận/huyện</FormLabel>
                                                <FormControl>
                                                    <div className='w-full'>
                                                        <Select className='min-w-[120px]' placeholder='Quận/huyện' value={addDistrict?.DistrictID} onChange={value => { setAddDistrict(listDistricts.find(target => target.DistrictID == value)) }}>
                                                            {
                                                                listDistricts.map((district, key) => {
                                                                    return <option key={key} value={district.DistrictID}>{district.DistrictName}</option>
                                                                })
                                                            }
                                                        </Select>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="commune"
                                        render={({ field }) =>
                                        (
                                            <FormItem>
                                                <FormLabel>Xã/thị trấn</FormLabel>
                                                <FormControl>
                                                    <div>
                                                        <Select className='min-w-[120px]' placeholder='Xã/thị trấn' value={addWard} onChange={value => { setAddWard(value) }}>
                                                            {
                                                                listWards.map((ward, key) => {
                                                                    return <option key={key} value={ward.WardName}>{ward.WardName}</option>
                                                                })
                                                            }
                                                        </Select>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="detail"
                                    render={({ field }) =>
                                    (
                                        <FormItem>
                                            <FormLabel>Địa chỉ chi tiết</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="địa chỉ chi tiết" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className='flex gap-4'>
                                    <Button type="primary" onClick={() => { handleSubmitForm(form.getValues()) }}>Tạo nhân viên</Button>
                                </div>
                            </div>
                        </div>
                    </form>
                </Form>
            </div>
        </div >
    )
}